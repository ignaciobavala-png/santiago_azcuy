"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarTexto } from "@/lib/admin/acciones-textos";
import type { TextoAdmin } from "@/lib/admin/datos";
import { Aviso, Boton } from "@/components/admin/ui";

/**
 * Un bloque por clave de texto, con castellano e ingles lado a lado. La clave
 * `.en` no se crea hasta que haya algo que guardar; si se vacia, se borra.
 */
export function AdminTextos({ textos }: { textos: TextoAdmin[] }) {
  return (
    <div className="mt-8 grid gap-6">
      {textos.map((t) => (
        <FilaTexto key={t.clave} texto={t} />
      ))}
    </div>
  );
}

function FilaTexto({ texto }: { texto: TextoAdmin }) {
  const router = useRouter();
  const [es, setEs] = useState(texto.es);
  const [en, setEn] = useState(texto.en);
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setEstado("Guardando…");
    setError(null);
    try {
      await guardarTexto(texto.clave, es, en);
      setEstado("Guardado.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setEstado(null);
    }
  }

  const area =
    "min-h-[10rem] w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-tinta-suave focus:border-tinta-media";

  return (
    <section className="border border-linea">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-linea bg-papel-alt px-4 py-2.5">
        <h2 className="text-sm font-medium">{texto.clave}</h2>
        <span className="etiqueta text-tinta-suave">{texto.titulo}</span>
      </header>
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <label className="block">
          <span className="etiqueta mb-1.5 block text-tinta-media">Castellano</span>
          <textarea value={es} onChange={(e) => { setEs(e.target.value); setEstado(null); }} placeholder="Texto en español…" className={area} />
        </label>
        <label className="block">
          <span className="etiqueta mb-1.5 block text-tinta-media">English</span>
          <textarea value={en} onChange={(e) => { setEn(e.target.value); setEstado(null); }} placeholder="English text… (si está vacío, el sitio cae al castellano)" className={area} />
        </label>
      </div>
      <footer className="flex items-center gap-4 border-t border-linea px-4 py-3">
        <Boton onClick={guardar} variante="solido">Guardar</Boton>
        {estado && <span className="text-sm text-tinta-media">{estado}</span>}
        {error && <Aviso tipo="error">{error}</Aviso>}
      </footer>
    </section>
  );
}
