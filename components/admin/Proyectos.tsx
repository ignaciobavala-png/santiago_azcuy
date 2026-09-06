"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  actualizarProyecto,
  borrarProyecto,
  crearProyecto,
} from "@/lib/admin/acciones-arquitectura";
import type { ProyectoAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, Campo, entrada } from "@/components/admin/ui";
import { slugDesde } from "@/lib/slug";

export type ProyectoLigero = Omit<ProyectoAdmin, "laminas">;

/** Campos comunes del proyecto, para alta y para edicion. */
export function FormProyecto({
  proyecto,
  alGuardar,
}: {
  proyecto?: ProyectoLigero;
  alGuardar?: (id: string) => void;
}) {
  const router = useRouter();
  const esNuevo = !proyecto;
  const [titulo, setTitulo] = useState(proyecto?.titulo ?? "");
  const [ubicacion, setUbicacion] = useState(proyecto?.ubicacion ?? "");
  const [anio, setAnio] = useState(proyecto?.anio ? String(proyecto.anio) : "");
  const [estado, setEstado] = useState(proyecto?.estado ?? "");
  const [descripcion, setDescripcion] = useState(proyecto?.descripcion ?? "");
  const [publicado, setPublicado] = useState(proyecto?.publicado ?? false);
  const [orden, setOrden] = useState(String(proyecto?.orden ?? 0));
  const [estadoMsg, setEstadoMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEstadoMsg("Guardando…");
    const fd = new FormData();
    fd.set("titulo", titulo);
    fd.set("ubicacion", ubicacion);
    fd.set("anio", anio);
    fd.set("estado", estado);
    fd.set("descripcion", descripcion);
    fd.set("publicado", publicado ? "1" : "");
    fd.set("orden", orden);
    try {
      if (esNuevo) {
        const id = await crearProyecto(fd);
        alGuardar?.(id);
      } else {
        await actualizarProyecto(proyecto.id, fd);
        setEstadoMsg("Guardado.");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEstadoMsg(null);
    }
  }

  return (
    <form onSubmit={guardar} className="grid max-w-4xl gap-x-8 gap-y-4 md:grid-cols-2">
      <Campo etiqueta="Título" className="md:col-span-2">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={entrada} />
      </Campo>
      {!esNuevo && (
        <p className="text-sm text-tinta-suave md:col-span-2">
          Slug <span className="font-mono">{proyecto.slug}</span> (se fija al crear; las láminas cuelgan de él).
        </p>
      )}
      {esNuevo && (
        <p className="text-sm text-tinta-suave md:col-span-2">
          Slug: <span className="font-mono">{slugDesde(titulo) || "…"}</span>
        </p>
      )}
      <Campo etiqueta="Ubicación">
        <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={entrada} />
      </Campo>
      <div className="flex gap-4">
        <Campo etiqueta="Año" ancho="xs">
          <input value={anio} onChange={(e) => setAnio(e.target.value)} type="number" className={entrada} />
        </Campo>
        <Campo etiqueta="Estado" ancho="sm">
          <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Proyecto" className={entrada} />
        </Campo>
      </div>
      <Campo etiqueta="Descripción" className="md:col-span-2">
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={5} className={entrada} />
      </Campo>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:col-span-2">
        <label className="flex cursor-pointer items-center gap-1.5">
          <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} className="h-4 w-4 accent-tinta" />
          <span className="text-sm text-tinta-media">Publicado (se ve en el sitio)</span>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-sm text-tinta-media">Orden</span>
          <input value={orden} onChange={(e) => setOrden(e.target.value)} type="number" className="w-20 rounded-md border border-linea bg-papel px-2 py-1.5 text-sm outline-none focus:border-tinta-media" />
        </label>
        <Boton type="submit" variante="solido" className="ml-auto">
          {esNuevo ? "Crear proyecto" : "Guardar cambios"}
        </Boton>
        {estadoMsg && <span className="text-sm text-tinta-media">{estadoMsg}</span>}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </form>
  );
}

export function NuevoProyecto() {
  const router = useRouter();
  return <FormProyecto alGuardar={(id) => router.push(`/admin/arquitectura/${id}`)} />;
}

function FilaProyecto({ proyecto }: { proyecto: ProyectoLigero }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function alternarPublicado() {
    setOcupado(true);
    setError(null);
    const fd = new FormData();
    fd.set("titulo", proyecto.titulo);
    fd.set("ubicacion", proyecto.ubicacion ?? "");
    fd.set("anio", proyecto.anio ? String(proyecto.anio) : "");
    fd.set("estado", proyecto.estado ?? "");
    fd.set("descripcion", proyecto.descripcion ?? "");
    fd.set("publicado", proyecto.publicado ? "" : "1");
    fd.set("orden", String(proyecto.orden));
    try {
      await actualizarProyecto(proyecto.id, fd);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setOcupado(false);
    }
  }

  async function borrar() {
    if (!window.confirm(`¿Borrar el proyecto «${proyecto.titulo}»? Se borran también sus láminas y archivos.`)) return;
    setError(null);
    try {
      await borrarProyecto(proyecto.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-linea py-3">
      <div className="min-w-0 flex-1">
        <Link href={`/admin/arquitectura/${proyecto.id}`} className="block truncate text-sm underline-offset-4 hover:underline">
          {proyecto.titulo}
        </Link>
        <p className="truncate text-xs text-tinta-suave">
          {proyecto.slug} · {[proyecto.ubicacion, proyecto.anio, proyecto.estado].filter(Boolean).join(" · ") || "sin ficha"}
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input type="checkbox" checked={proyecto.publicado} disabled={ocupado} onChange={alternarPublicado} className="h-3.5 w-3.5 accent-tinta" />
        <span className="text-xs text-tinta-media">Publicado</span>
      </label>
      <Link href={`/admin/arquitectura/${proyecto.id}`} className="etiqueta text-tinta-media hover:text-tinta">
        Editar
      </Link>
      <Boton variante="peligro" onClick={borrar} className="!px-2 !py-1 text-xs">Borrar</Boton>
      {error && <p className="w-full text-xs text-tinta">{error}</p>}
    </div>
  );
}

export function ListaProyectos({ proyectos }: { proyectos: ProyectoLigero[] }) {
  return (
    <div>
      <h2 className="titular text-lg">Proyectos</h2>
      {proyectos.length === 0 ? (
        <p className="py-6 text-tinta-media">Todavía no hay proyectos.</p>
      ) : (
        <div className="mt-4 border-t border-linea">
          {proyectos.map((p) => (
            <FilaProyecto key={p.id} proyecto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
