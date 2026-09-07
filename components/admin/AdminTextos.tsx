"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { guardarTextos, type CambioTexto } from "@/lib/admin/acciones-textos";
import type { CampoTexto, GrupoTexto } from "@/lib/admin/datos";
import { Aviso, Boton } from "@/components/admin/ui";

/**
 * Un grupo por zona de la pagina, y dentro un campo por frase con el
 * castellano y el ingles al lado. Lo que se ve en gris dentro del campo vacio
 * es el texto que sale hoy: mientras nadie escriba encima, eso es lo publicado.
 * Se guarda por grupo y no por campo para que corregir cinco frases de la
 * portada sea un boton y no cinco.
 */
export function AdminTextos({ grupos }: { grupos: GrupoTexto[] }) {
  return (
    <>
      <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-y border-linea py-3">
        {grupos.map((g) => (
          <a
            key={g.id}
            href={`#grupo-${g.id}`}
            className="etiqueta text-tinta-media underline-offset-4 hover:text-tinta hover:underline"
          >
            {g.titulo}
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-10">
        {grupos.map((g) => (
          <Grupo key={g.id} grupo={g} />
        ))}
      </div>
    </>
  );
}

type Borrador = Record<string, { es: string; en: string }>;

const inicial = (campos: CampoTexto[]): Borrador =>
  Object.fromEntries(campos.map((c) => [c.clave, { es: c.es, en: c.en }]));

function Grupo({ grupo }: { grupo: GrupoTexto }) {
  const router = useRouter();
  const guardado = useMemo(() => inicial(grupo.campos), [grupo.campos]);
  const [borrador, setBorrador] = useState<Borrador>(guardado);
  const [estado, setEstado] = useState<"listo" | "guardando" | "hecho">("listo");
  const [error, setError] = useState<string | null>(null);

  const cambios: CambioTexto[] = grupo.campos
    // Se compara sin espacios de borde porque el servidor tambien los recorta:
    // si no, un espacio de mas dejaria el grupo con "1 cambio" para siempre.
    .filter(
      (c) =>
        borrador[c.clave].es.trim() !== guardado[c.clave].es.trim() ||
        borrador[c.clave].en.trim() !== guardado[c.clave].en.trim()
    )
    .map((c) => ({ clave: c.clave, ...borrador[c.clave] }));

  function escribir(clave: string, idioma: "es" | "en", valor: string) {
    setBorrador((b) => ({ ...b, [clave]: { ...b[clave], [idioma]: valor } }));
    setEstado("listo");
    setError(null);
  }

  async function guardar() {
    setEstado("guardando");
    setError(null);
    try {
      await guardarTextos(cambios);
      setEstado("hecho");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setEstado("listo");
    }
  }

  if (grupo.campos.length === 0) return null;

  return (
    <section id={`grupo-${grupo.id}`} className="scroll-mt-6 border border-linea">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-linea bg-papel-alt px-4 py-3">
        <h2 className="text-[0.9375rem] font-medium">{grupo.titulo}</h2>
        {grupo.nota && <p className="max-w-prose text-sm text-tinta-media">{grupo.nota}</p>}
      </header>

      <div className="divide-y divide-linea">
        {grupo.campos.map((c) => (
          <Campo
            key={c.clave}
            campo={c}
            valor={borrador[c.clave]}
            onEscribir={(idioma, v) => escribir(c.clave, idioma, v)}
          />
        ))}
      </div>

      <footer className="flex flex-wrap items-center gap-4 border-t border-linea px-4 py-3">
        <Boton onClick={guardar} variante="solido" disabled={cambios.length === 0 || estado === "guardando"}>
          {estado === "guardando" ? "Guardando…" : "Guardar"}
        </Boton>
        <span className="text-sm text-tinta-media">
          {estado === "hecho" && cambios.length === 0
            ? "Guardado. Ya está en vivo."
            : cambios.length === 0
              ? "Sin cambios."
              : `${cambios.length} ${cambios.length === 1 ? "cambio" : "cambios"} sin guardar.`}
        </span>
        {error && <Aviso tipo="error">{error}</Aviso>}
      </footer>
    </section>
  );
}

function Campo({
  campo,
  valor,
  onEscribir,
}: {
  campo: CampoTexto;
  valor: { es: string; en: string };
  onEscribir: (idioma: "es" | "en", v: string) => void;
}) {
  const propio = valor.es.trim() !== "" || valor.en.trim() !== "";

  return (
    <div className="px-4 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-sm">{campo.etiqueta}</h3>
        {propio ? (
          <span className="etiqueta text-tinta-suave">editado</span>
        ) : (
          <span className="etiqueta text-tinta-suave">como viene</span>
        )}
        {campo.huecos.length > 0 && (
          <span className="text-[0.8125rem] text-tinta-media">
            dejá {campo.huecos.join(" y ")} donde va el dato
          </span>
        )}
      </div>

      <div className="mt-2.5 grid gap-3 lg:grid-cols-2">
        <Area
          idioma="Castellano"
          valor={valor.es}
          porDefecto={campo.porDefecto.es}
          vacio="Todavía sin cargar: no se muestra nada."
          onEscribir={(v) => onEscribir("es", v)}
        />
        <Area
          idioma="English"
          valor={valor.en}
          porDefecto={campo.porDefecto.en}
          vacio="Si queda vacío, sale el castellano."
          onEscribir={(v) => onEscribir("en", v)}
        />
      </div>
    </div>
  );
}

/**
 * El alto sale del texto mas largo entre lo escrito y el original, para que una
 * frase de tres palabras no ocupe lo mismo que una sinopsis.
 */
function Area({
  idioma,
  valor,
  porDefecto,
  vacio,
  onEscribir,
}: {
  idioma: string;
  valor: string;
  porDefecto: string;
  vacio: string;
  onEscribir: (v: string) => void;
}) {
  const largo = Math.max(valor.length, porDefecto.length);
  const saltos = (valor || porDefecto).split("\n").length;
  const filas = Math.min(10, Math.max(saltos, Math.ceil(largo / 52)));

  return (
    <label className="block">
      <span className="etiqueta mb-1.5 block text-tinta-suave">{idioma}</span>
      <textarea
        value={valor}
        rows={filas}
        onChange={(e) => onEscribir(e.target.value)}
        placeholder={porDefecto || vacio}
        spellCheck
        className="w-full resize-y rounded-md border border-linea bg-papel px-3 py-2 text-sm leading-relaxed text-tinta outline-none transition-colors placeholder:text-tinta-suave focus:border-tinta-media"
      />
    </label>
  );
}
