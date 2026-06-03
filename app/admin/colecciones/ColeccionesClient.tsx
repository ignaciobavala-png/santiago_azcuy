"use client"

import { useState, useTransition } from "react"
import { eliminarSerie } from "./actions"

interface Serie {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  año_inicio: number | null
  año_fin: number | null
  obras_count: number
}

export default function ColeccionesClient({ series }: { series: Serie[] }) {
  const [lista, setLista] = useState(series)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleEliminar = (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la colección "${nombre}"? Las obras quedarán sin colección asignada.`)) return
    startTransition(async () => {
      try {
        await eliminarSerie(id)
        setLista((prev) => prev.filter((s) => s.id !== id))
      } catch (e) {
        setError(String(e))
      }
    })
  }

  if (lista.length === 0) {
    return (
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
        Sin colecciones creadas. Creá una antes de subir obras.
      </p>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {lista.map((col) => (
          <div key={col.id} className="py-5 flex items-start justify-between gap-8 group">
            <div className="flex-1">
              <div className="flex items-baseline gap-4">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
                  {col.nombre}
                </p>
                {(col.año_inicio || col.año_fin) && (
                  <span className="text-xs text-[var(--color-muted)]">
                    {col.año_inicio}
                    {col.año_fin && col.año_fin !== col.año_inicio ? `–${col.año_fin}` : ""}
                  </span>
                )}
              </div>
              {col.descripcion && (
                <p className="text-sm text-[var(--color-muted)] mt-1">{col.descripcion}</p>
              )}
              <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mt-2">
                {col.obras_count} obra{col.obras_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEliminar(col.id, col.nombre)}
                disabled={isPending}
                className="text-xs tracking-[0.15em] uppercase text-[var(--color-danger)] hover:opacity-70 transition-opacity disabled:opacity-30"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
