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
 *
 * Solo un grupo esta expandido a la vez (acordeon): antes se pintaban todos
 * enteros uno debajo del otro y encontrar un campo era un scroll larguisimo.
 * El link "Ver en la página" de cada grupo es la otra mitad del problema que
 * marcó Santiago — sin eso, el nombre del grupo era la unica referencia de
 * donde vive el texto que esta por tocar.
 */
export function AdminTextos({ grupos }: { grupos: GrupoTexto[] }) {
  const conCampos = useMemo(() => grupos.filter((g) => g.campos.length > 0), [grupos]);
  const [abierto, setAbierto] = useState<string | null>(conCampos[0]?.id ?? null);

  const item = (activo: boolean) =>
    `etiqueta block w-full truncate border-l-2 px-3 py-1.5 text-left transition-colors ${
      activo ? "border-tinta text-tinta" : "border-linea text-tinta-media hover:border-tinta-suave hover:text-tinta"
    }`;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_1fr] lg:items-start">
      <nav className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-0.5">
        {conCampos.map((g) => (
          <button key={g.id} type="button" onClick={() => setAbierto(g.id)} className={item(abierto === g.id)}>
            {g.titulo}
          </button>
        ))}
      </nav>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 border-y border-linea py-3 lg:hidden">
        {conCampos.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setAbierto(g.id)}
            className={`etiqueta underline-offset-4 ${
              abierto === g.id ? "text-tinta underline" : "text-tinta-media hover:text-tinta hover:underline"
            }`}
          >
            {g.titulo}
          </button>
        ))}
      </nav>

      <div className="grid gap-4">
        {conCampos.map((g) => (
          <Grupo
            key={g.id}
            grupo={g}
            abierto={abierto === g.id}
            onAbrir={() => setAbierto((actual) => (actual === g.id ? null : g.id))}
          />
        ))}
      </div>
    </div>
  );
}

type Borrador = Record<string, { es: string; en: string }>;

const inicial = (campos: CampoTexto[]): Borrador =>
  Object.fromEntries(campos.map((c) => [c.clave, { es: c.es, en: c.en }]));

function Grupo({
  grupo,
  abierto,
  onAbrir,
}: {
  grupo: GrupoTexto;
  abierto: boolean;
  onAbrir: () => void;
}) {
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

  return (
    <section id={`grupo-${grupo.id}`} className="scroll-mt-6 border border-linea">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-papel-alt px-4 py-3">
        <button type="button" onClick={onAbrir} className="flex flex-1 flex-wrap items-baseline gap-x-3 gap-y-1 text-left">
          <span aria-hidden className="text-tinta-suave">
            {abierto ? "▾" : "▸"}
          </span>
          <h2 className="text-[0.9375rem] font-medium">{grupo.titulo}</h2>
          {grupo.nota && <p className="max-w-prose text-sm text-tinta-media">{grupo.nota}</p>}
          {cambios.length > 0 && (
            <span className="etiqueta text-tinta">{cambios.length} sin guardar</span>
          )}
        </button>
        {grupo.ruta && (
          <a
            href={grupo.ruta}
            target="_blank"
            rel="noopener noreferrer"
            className="etiqueta shrink-0 text-tinta-media underline-offset-4 hover:text-tinta hover:underline"
          >
            Ver en la página ↗
          </a>
        )}
      </header>

      {abierto && (
        <>
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
        </>
      )}
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
