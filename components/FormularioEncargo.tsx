"use client";

import { useState } from "react";
import {
  procesarAdjunto,
  subirAdjuntoFirmado,
  type AdjuntoListo,
} from "@/lib/imagen-navegador";
import { MAX_ADJUNTOS, TIPOS_ENCARGO, DESTINOS_ENCARGO } from "@/lib/tipos";
import type { Diccionario, Lang } from "@/lib/i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const entrada =
  "w-full border border-linea bg-transparent px-3.5 py-2.5 text-[0.9375rem] text-tinta outline-none transition-colors placeholder:text-tinta-suave focus:border-tinta";
const label = "etiqueta mb-1.5 block text-tinta-media";

type Estado = "editando" | "enviando" | "ok";

/**
 * Formulario de Proyectos por Encargo.
 *
 * Los adjuntos se comprimen en el navegador y suben directo a Supabase con una
 * URL firmada que pide al server, asi que el archivo nunca pasa por Vercel ni
 * gasta su limite de 4,5 MB por request. Recien despues de que las imagenes
 * estan arriba se crea la solicitud, y si esa escritura falla el server borra
 * los archivos que ya se habian subido.
 */
export function FormularioEncargo({ lang, d }: { lang: Lang; d: Diccionario["encargos"] }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [tipoProyecto, setTipoProyecto] = useState("");
  const [tipoOtro, setTipoOtro] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [destino, setDestino] = useState("");
  const [destinoOtro, setDestinoOtro] = useState("");
  const [referencias, setReferencias] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [website, setWebsite] = useState("");

  const [estado, setEstado] = useState<Estado>("editando");
  const [paso, setPaso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function sumarArchivos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const nuevos: File[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) {
        setError(`${f.name}: solo se aceptan imágenes.`);
        continue;
      }
      nuevos.push(f);
    }
    const total = [...archivos, ...nuevos];
    if (total.length > MAX_ADJUNTOS) {
      setError(d.campos.adjuntosAyuda);
      setArchivos(total.slice(0, MAX_ADJUNTOS));
      return;
    }
    setArchivos(total);
  }

  const quitarArchivo = (i: number) =>
    setArchivos((prev) => prev.filter((_, j) => j !== i));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) return setError(d.campos.nombre);
    if (!EMAIL.test(email.trim())) return setError(d.errorMail);
    if (descripcion.trim().length < 20) return setError(d.errorCorto);
    if (!tipoProyecto) return setError(d.campos.tipoProyecto);
    if (!destino) return setError(d.campos.destino);

    setEstado("enviando");
    try {
      // 1. Comprimir en el navegador (una por una para no llenar la memoria).
      const listos: AdjuntoListo[] = [];
      for (let i = 0; i < archivos.length; i++) {
        setPaso(`${d.campos.adjuntos} ${i + 1}/${archivos.length}…`);
        listos.push(await procesarAdjunto(archivos[i]));
      }

      // 2. Pedir las URLs firmadas de subida.
      let subidas: { path: string; token: string }[] = [];
      if (listos.length > 0) {
        setPaso("Preparando la subida…");
        const res = await fetch("/api/encargos/firma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            archivos: listos.map((a) => ({ nombre: a.nombre, tipo: a.tipo, bytes: a.bytes })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? d.errorEnvio);
        subidas = data.subidas ?? [];
      }

      // 3. Subir directo a Supabase.
      for (let i = 0; i < listos.length; i++) {
        setPaso(`Subiendo ${i + 1}/${listos.length}…`);
        await subirAdjuntoFirmado(subidas[i].path, subidas[i].token, listos[i].blob);
      }

      // 4. Crear la solicitud.
      setPaso(d.enviando);
      const res = await fetch("/api/encargos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          nombre,
          email,
          whatsapp,
          ciudad,
          pais,
          tipoProyecto,
          tipoOtro,
          descripcion,
          destino,
          destinoOtro,
          referencias,
          website,
          archivos: subidas.map((s, i) => ({
            path: s.path,
            nombre: listos[i].nombre,
            bytes: listos[i].bytes,
            tipo: listos[i].tipo,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.errorEnvio);

      setEstado("ok");
      setPaso(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.errorEnvio);
      setEstado("editando");
      setPaso(null);
    }
  }

  if (estado === "ok") {
    return (
      <div role="status" className="border-t border-linea pt-8">
        <h2 className="titular">{d.exitoTitulo}</h2>
        <p className="mt-4 max-w-md leading-relaxed text-tinta-media">{d.exitoTexto}</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-7" noValidate>
      {/* Honeypot: invisible para una persona, tentador para un bot. */}
      <div className="hidden" aria-hidden>
        <label>
          No completar
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{d.campos.nombre} *</span>
          <input className={entrada} value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
        </label>
        <label className="block">
          <span className={label}>{d.campos.email} *</span>
          <input
            type="email"
            className={entrada}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className={label}>{d.campos.whatsapp}</span>
          <input className={entrada} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} autoComplete="tel" />
        </label>
        <label className="block">
          <span className={label}>{d.campos.ciudad}</span>
          <input className={entrada} value={ciudad} onChange={(e) => setCiudad(e.target.value)} autoComplete="address-level2" />
        </label>
        <label className="block">
          <span className={label}>{d.campos.pais}</span>
          <input className={entrada} value={pais} onChange={(e) => setPais(e.target.value)} autoComplete="country-name" />
        </label>
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        {/* Sin "otro" el select va a todo el ancho; con "otro" comparte fila con
            su casilla de texto. */}
        <label className={tipoProyecto === "otro" ? "block" : "block sm:col-span-2"}>
          <span className={label}>{d.campos.tipoProyecto} *</span>
          <select className={entrada} value={tipoProyecto} onChange={(e) => setTipoProyecto(e.target.value)}>
            <option value="">{d.campos.elegir}</option>
            {TIPOS_ENCARGO.map((k) => (
              <option key={k} value={k}>
                {d.opciones.tipos[k]}
              </option>
            ))}
          </select>
        </label>
        {tipoProyecto === "otro" && (
          <label className="block">
            <span className={label}>{d.campos.tipoOtro}</span>
            <input className={entrada} value={tipoOtro} onChange={(e) => setTipoOtro(e.target.value)} />
          </label>
        )}
      </fieldset>

      <label className="block">
        <span className={label}>{d.campos.descripcion} *</span>
        <textarea
          rows={8}
          className={`${entrada} resize-y leading-relaxed`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <span className="mt-2 block max-w-prose text-sm text-tinta-suave">{d.campos.descripcionAyuda}</span>
      </label>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <label className={destino === "otro" ? "block" : "block sm:col-span-2"}>
          <span className={label}>{d.campos.destino} *</span>
          <select className={entrada} value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="">{d.campos.elegir}</option>
            {DESTINOS_ENCARGO.map((k) => (
              <option key={k} value={k}>
                {d.opciones.destinos[k]}
              </option>
            ))}
          </select>
        </label>
        {destino === "otro" && (
          <label className="block">
            <span className={label}>{d.campos.destinoOtro}</span>
            <input className={entrada} value={destinoOtro} onChange={(e) => setDestinoOtro(e.target.value)} />
          </label>
        )}
      </fieldset>

      <label className="block">
        <span className={label}>{d.campos.referencias}</span>
        <textarea
          rows={3}
          className={`${entrada} resize-y leading-relaxed`}
          value={referencias}
          onChange={(e) => setReferencias(e.target.value)}
        />
      </label>

      <div>
        <label className="inline-flex cursor-pointer items-center border border-linea px-4 py-2.5 text-sm transition-colors hover:border-tinta-media">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              sumarArchivos(e.target.files);
              e.target.value = "";
            }}
          />
          {d.campos.sumar}
        </label>
        <p className="mt-2 text-sm text-tinta-suave">{d.campos.adjuntosAyuda}</p>

        {archivos.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {archivos.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 text-sm text-tinta-media">
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => quitarArchivo(i)}
                  className="etiqueta ml-auto shrink-0 text-tinta-suave hover:text-tinta"
                >
                  {d.campos.quitar}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="border-y border-linea bg-papel-alt px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="etiqueta border border-tinta px-6 py-3 transition-colors hover:bg-tinta hover:text-papel disabled:cursor-not-allowed disabled:opacity-40"
        >
          {estado === "enviando" ? d.enviando : d.enviar}
        </button>
        {paso && <span className="text-sm text-tinta-suave">{paso}</span>}
      </div>
    </form>
  );
}
