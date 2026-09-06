"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { actualizarPista, alternarVisible, borrarPista, crearPista, moverPista } from "@/lib/admin/acciones-musica";
import type { PistaAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, Campo, entrada } from "@/components/admin/ui";

const TIPOS = ["album", "clip", "tema", "entrevista"] as const;
export const TIPOS_LABEL: Record<(typeof TIPOS)[number], string> = {
  album: "Álbumes",
  clip: "Clips",
  tema: "Temas",
  entrevista: "Entrevistas",
};

/** Alta pegando la URL de YouTube: el server resuelve titulo y miniatura. */
function AltaPista() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("album");
  const [duracion, setDuracion] = useState("");
  const [anio, setAnio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("Buscando en YouTube…");
    setError(null);
    const fd = new FormData();
    fd.set("url", url);
    fd.set("tipo", tipo);
    fd.set("duracion", duracion);
    fd.set("anio", anio);
    fd.set("descripcion", descripcion);
    try {
      await crearPista(fd);
      setEstado("Pieza agregada.");
      setUrl("");
      setDuracion("");
      setAnio("");
      setDescripcion("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear.");
      setEstado(null);
    }
  }

  return (
    <form onSubmit={enviar} className="grid gap-3 border border-linea p-4 md:grid-cols-12">
      <Campo etiqueta="URL de YouTube" className="md:col-span-6">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className={entrada}
        />
      </Campo>
      <Campo etiqueta="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as (typeof TIPOS)[number])} className={entrada}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPOS_LABEL[t]}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Duración" ancho="sm">
        <input value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="4:12" className={entrada} />
      </Campo>
      <Campo etiqueta="Año" ancho="xs">
        <input value={anio} onChange={(e) => setAnio(e.target.value)} type="number" placeholder="2023" className={entrada} />
      </Campo>
      <Campo etiqueta="Descripción" className="md:col-span-6">
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={entrada} />
      </Campo>
      <div className="flex items-end gap-3 md:col-span-6">
        <Boton type="submit" variante="solido">Agregar pieza</Boton>
        {estado && <span className="text-sm text-tinta-media">{estado}</span>}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </form>
  );
}

function FilaPista({ pista }: { pista: PistaAdmin }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orden, setOrden] = useState(String(pista.orden));

  async function correr(fn: () => Promise<void>) {
    setOcupado(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  }

  function guardarOrden() {
    const n = Number(orden);
    if (!Number.isInteger(n) || n === pista.orden) {
      setOrden(String(pista.orden));
      return;
    }
    const fd = new FormData();
    // Reusa actualizarPista para el orden: levanta los campos desde la fila.
    fd.set("tipo", pista.tipo);
    fd.set("titulo", pista.titulo);
    fd.set("recurso", pista.recurso);
    fd.set("duracion", pista.duracion ?? "");
    fd.set("anio", pista.anio ? String(pista.anio) : "");
    fd.set("descripcion", pista.descripcion ?? "");
    fd.set("orden", String(n));
    correr(async () => {
      await actualizarPista(pista.id, fd);
    });
  }

  const flecha = (direccion: "arriba" | "abajo", simbolo: string) => (
    <button
      type="button"
      disabled={ocupado}
      onClick={() => correr(() => moverPista(pista.id, direccion))}
      aria-label={`Mover ${direccion}`}
      className="px-1 text-tinta-media hover:text-tinta disabled:opacity-40"
    >
      {simbolo}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-linea py-2">
      <img
        src={`https://i.ytimg.com/vi/${pista.recurso}/${pista.miniatura}.jpg`}
        alt=""
        width={64}
        height={36}
        loading="lazy"
        className="h-9 w-16 shrink-0 rounded-sm object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{pista.titulo}</p>
        <p className="text-xs text-tinta-suave">
          {pista.duracion ?? "—"} · {pista.anio ?? "s/a"} · miniatura {pista.miniatura}
        </p>
      </div>
      <div className="flex items-center">
        {flecha("arriba", "↑")}
        {flecha("abajo", "↓")}
        <input
          type="number"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          onBlur={guardarOrden}
          disabled={ocupado}
          className="w-14 rounded border border-linea bg-papel px-1.5 py-0.5 text-xs outline-none focus:border-tinta-media"
        />
      </div>
      <Boton
        onClick={() => correr(() => alternarVisible(pista.id))}
        className="!px-2 !py-1 text-xs"
      >
        {pista.visible ? "Ocultar" : "Mostrar"}
      </Boton>
      <Link href={`/admin/musica/${pista.id}`} className="etiqueta text-tinta-media hover:text-tinta">
        Editar
      </Link>
      <Boton
        variante="peligro"
        className="!px-2 !py-1 text-xs"
        onClick={() => {
          if (window.confirm(`¿Borrar «${pista.titulo}»?`)) correr(() => borrarPista(pista.id));
        }}
      >
        Borrar
      </Boton>
      {error && <p className="w-full text-xs text-tinta">{error}</p>}
    </div>
  );
}

export function AdminMusica({ pistas }: { pistas: PistaAdmin[] }) {
  const porTipo: Record<(typeof TIPOS)[number], PistaAdmin[]> = { album: [], clip: [], tema: [], entrevista: [] };
  for (const p of pistas) porTipo[p.tipo].push(p);

  return (
    <div className="mt-8 grid gap-10">
      <section>
        <h2 className="etiqueta text-tinta-suave">Alta por URL</h2>
        <div className="mt-3">
          <AltaPista />
        </div>
      </section>

      {TIPOS.map((tipo) => (
        <section key={tipo}>
          <h2 className="titular text-lg">{TIPOS_LABEL[tipo]}</h2>
          <p className="etiqueta mt-1 text-tinta-suave">{porTipo[tipo].length} piezas</p>
          <div className="mt-3 border-t border-linea">
            {porTipo[tipo].length === 0 ? (
              <p className="py-4 text-sm text-tinta-media">Sin piezas todavía.</p>
            ) : (
              porTipo[tipo].map((p) => <FilaPista key={p.id} pista={p} />)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
