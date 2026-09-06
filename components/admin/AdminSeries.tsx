"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarSerie, borrarSerie, crearSerie } from "@/lib/admin/acciones-series";
import type { Serie } from "@/lib/tipos";
import { Aviso, Boton, Campo, entrada } from "@/components/admin/ui";
import { slugDesde } from "@/lib/slug";

/**
 * ABM de series. El listado lo pinta la pagina server; este componente solo
 * orquesta las acciones y refresca para que la pagina vuelva a leer. No guarda
 * copia del listado, asi una baja o un alta nunca quedan desincronizadas.
 */
export function AdminSeries({ series }: { series: Serie[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nueva, setNueva] = useState({ nombre: "", slug: "", descripcion: "" });

  async function correr(fn: () => Promise<void>, ok?: () => void) {
    setError(null);
    try {
      await fn();
      ok?.();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  function alta(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("nombre", nueva.nombre);
    fd.set("slug", nueva.slug);
    fd.set("descripcion", nueva.descripcion);
    correr(async () => crearSerie(fd), () => setNueva({ nombre: "", slug: "", descripcion: "" }));
  }

  return (
    <div>
      <form onSubmit={alta} className="grid gap-3 border-b border-linea py-6 md:grid-cols-12">
        <Campo etiqueta="Nombre (nueva serie)" className="md:col-span-4">
          <input
            value={nueva.nombre}
            onChange={(e) =>
              setNueva({ ...nueva, nombre: e.target.value, slug: nueva.slug || slugDesde(e.target.value) })
            }
            className={entrada}
          />
        </Campo>
        <Campo etiqueta="Slug" className="md:col-span-3">
          <input value={nueva.slug} onChange={(e) => setNueva({ ...nueva, slug: e.target.value })} className={entrada} />
        </Campo>
        <Campo etiqueta="Descripción" className="md:col-span-5">
          <input
            value={nueva.descripcion}
            onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
            className={entrada}
          />
        </Campo>
        <div className="md:col-span-12">
          <Boton type="submit" variante="solido">Crear serie</Boton>
        </div>
        {error && <Aviso tipo="error">{error}</Aviso>}
      </form>

      {series.length === 0 ? (
        <p className="py-8 text-tinta-media">Todavía no hay series. La primera se crea arriba.</p>
      ) : (
        series.map((s) => <FilaSerie key={s.id} serie={s} />)
      )}
    </div>
  );
}

function FilaSerie({ serie }: { serie: Serie }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(serie.nombre);
  const [slug, setSlug] = useState(serie.slug);
  const [descripcion, setDescripcion] = useState(serie.descripcion ?? "");
  const [orden, setOrden] = useState(String(serie.orden ?? 0));
  const [filaError, setFilaError] = useState<string | null>(null);

  async function guardar() {
    const fd = new FormData();
    fd.set("nombre", nombre);
    fd.set("slug", slug);
    fd.set("descripcion", descripcion);
    fd.set("orden", orden);
    try {
      await actualizarSerie(serie.id, fd);
      setEditando(false);
      router.refresh();
    } catch (e) {
      setFilaError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  async function borrar() {
    if (!window.confirm(`¿Borrar la serie «${serie.nombre}»? Las obras que la usan quedan sin serie.`)) return;
    try {
      await borrarSerie(serie.id);
      router.refresh();
    } catch (e) {
      setFilaError(e instanceof Error ? e.message : "No se pudo borrar.");
    }
  }

  if (!editando) {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-linea py-3">
        <span className="w-48 truncate text-sm">{serie.nombre}</span>
        <span className="etiqueta text-tinta-suave">{serie.slug}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-tinta-media">{serie.descripcion ?? ""}</span>
        <span className="text-sm text-tinta-suave">orden {serie.orden}</span>
        <Boton onClick={() => setEditando(true)}>Editar</Boton>
      </div>
    );
  }

  return (
    <div className="grid gap-3 border-b border-linea py-4 md:grid-cols-12">
      <Campo etiqueta="Nombre" className="md:col-span-3">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={entrada} />
      </Campo>
      <Campo etiqueta="Slug" className="md:col-span-3">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={entrada} />
      </Campo>
      <Campo etiqueta="Descripción" className="md:col-span-4">
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={entrada} />
      </Campo>
      <Campo etiqueta="Orden" ancho="xs">
        <input value={orden} type="number" onChange={(e) => setOrden(e.target.value)} className={entrada} />
      </Campo>
      <div className="flex items-end gap-2 md:col-span-12">
        <Boton onClick={guardar} variante="solido">Guardar</Boton>
        <Boton onClick={() => setEditando(false)}>Cancelar</Boton>
        <Boton variante="peligro" onClick={borrar} className="ml-auto">Borrar</Boton>
      </div>
      {filaError && <Aviso tipo="error">{filaError}</Aviso>}
    </div>
  );
}
