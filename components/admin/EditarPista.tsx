"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarPista } from "@/lib/admin/acciones-musica";
import type { PistaAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, Campo, entrada } from "@/components/admin/ui";
import { TIPOS_LABEL } from "@/components/admin/AdminMusica";

const TIPOS = Object.keys(TIPOS_LABEL) as (keyof typeof TIPOS_LABEL)[];

export function EditarPista({ pista }: { pista: PistaAdmin }) {
  const router = useRouter();
  const [tipo, setTipo] = useState(pista.tipo);
  const [titulo, setTitulo] = useState(pista.titulo);
  const [duracion, setDuracion] = useState(pista.duracion ?? "");
  const [anio, setAnio] = useState(pista.anio ? String(pista.anio) : "");
  const [descripcion, setDescripcion] = useState(pista.descripcion ?? "");
  const [orden, setOrden] = useState(String(pista.orden));
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("Guardando…");
    setError(null);
    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("titulo", titulo);
    fd.set("recurso", pista.recurso);
    fd.set("duracion", duracion);
    fd.set("anio", anio);
    fd.set("descripcion", descripcion);
    fd.set("orden", orden);
    try {
      await actualizarPista(pista.id, fd);
      setEstado("Guardado.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEstado(null);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-6 grid max-w-3xl gap-4">
      <Campo etiqueta="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as PistaAdmin["tipo"])} className={entrada}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPOS_LABEL[t]}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Título">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={entrada} />
      </Campo>
      <Campo etiqueta="Id del video (no se edita)">
        <input value={pista.recurso} disabled className={`${entrada} opacity-50`} />
      </Campo>
      <div className="flex gap-4">
        <Campo etiqueta="Duración" ancho="sm">
          <input value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="4:12" className={entrada} />
        </Campo>
        <Campo etiqueta="Año" ancho="xs">
          <input value={anio} onChange={(e) => setAnio(e.target.value)} type="number" className={entrada} />
        </Campo>
        <Campo etiqueta="Orden">
          <input value={orden} onChange={(e) => setOrden(e.target.value)} type="number" className={entrada} />
        </Campo>
      </div>
      <Campo etiqueta="Descripción">
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className={entrada} />
      </Campo>
      <div className="flex items-center gap-4">
        <Boton type="submit" variante="solido">Guardar cambios</Boton>
        {estado && <span className="text-sm text-tinta-media">{estado}</span>}
        {error && <Aviso tipo="error">{error}</Aviso>}
      </div>
    </form>
  );
}
