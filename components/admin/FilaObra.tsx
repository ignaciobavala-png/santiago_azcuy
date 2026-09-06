"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { actualizarObra } from "@/lib/admin/acciones-obras";
import type { ObraAdmin } from "@/lib/admin/datos";
import { url } from "@/lib/media";

/**
 * Una fila de la lista de obras. Publicada, destacada, disponible y orden se
 * editan aca mismo; el resto (ficha completa) vive en la pagina de la obra.
 * Cada cambio dispara una Server Action y refresca la lista, que es la que
 * decide si la fila sigue entrando en el filtro activo.
 */
export function FilaObra({ obra }: { obra: ObraAdmin }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orden, setOrden] = useState(String(obra.orden));

  async function cambiar(campos: Parameters<typeof actualizarObra>[1]) {
    setOcupado(true);
    setError(null);
    try {
      await actualizarObra(obra.id, campos);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setOcupado(false);
    }
  }

  function guardarOrden() {
    const n = Number(orden);
    if (!Number.isInteger(n) || n === obra.orden) {
      setOrden(String(obra.orden));
      return;
    }
    cambiar({ orden: n });
  }

  const conmutador = (valor: boolean, etiqueta: string, campo: "publicada" | "destacada" | "disponible") => (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input
        type="checkbox"
        checked={valor}
        disabled={ocupado}
        onChange={() => cambiar({ [campo]: !valor })}
        className="h-3.5 w-3.5 accent-tinta"
      />
      <span className="text-xs text-tinta-media">{etiqueta}</span>
    </label>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-linea py-2">
      <img
        src={url(obra.imagen, "sm")}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="h-10 w-10 shrink-0 rounded-sm object-cover"
      />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/obras/${obra.id}`} className="block truncate text-sm underline-offset-4 hover:underline">
          {obra.titulo}
        </Link>
        <p className="truncate text-xs text-tinta-suave">
          {obra.categoria}
          {obra.es_encargo ? " · encargo" : ""}
          {obra.anio ? ` · ${obra.anio}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {conmutador(obra.publicada, "Publicada", "publicada")}
        {conmutador(obra.destacada, "Destacada", "destacada")}
        {conmutador(obra.disponible, "Disponible", "disponible")}
        <label className="flex items-center gap-1.5">
          <span className="text-xs text-tinta-media">Orden</span>
          <input
            type="number"
            value={orden}
            disabled={ocupado}
            onChange={(e) => setOrden(e.target.value)}
            onBlur={guardarOrden}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-16 rounded border border-linea bg-papel px-1.5 py-0.5 text-xs outline-none focus:border-tinta-media"
          />
        </label>
        <Link href={`/admin/obras/${obra.id}`} className="etiqueta text-tinta-media hover:text-tinta">
          Editar
        </Link>
      </div>
      {error && <p className="w-full text-xs text-tinta">{error}</p>}
    </div>
  );
}
