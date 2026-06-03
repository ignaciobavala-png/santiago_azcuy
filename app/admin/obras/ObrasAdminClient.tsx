"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { togglePublicada, eliminarObra } from "./actions"

interface Obra {
  id: string
  slug: string
  titulo: string
  año: number | null
  tecnica: string | null
  imagen_url: string | null
  publicada: boolean
  disponible: boolean
  series: { nombre: string } | null
}

export default function ObrasAdminClient({ obras: inicial }: { obras: Obra[] }) {
  const [obras, setObras] = useState(inicial)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (id: string, publicada: boolean) => {
    setObras((prev) => prev.map((o) => o.id === id ? { ...o, publicada } : o))
    startTransition(async () => {
      try {
        await togglePublicada(id, publicada)
      } catch (e) {
        setError(String(e))
        setObras((prev) => prev.map((o) => o.id === id ? { ...o, publicada: !publicada } : o))
      }
    })
  }

  const handleEliminar = (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await eliminarObra(id)
        setObras((prev) => prev.filter((o) => o.id !== id))
      } catch (e) {
        setError(String(e))
      }
    })
  }

  if (obras.length === 0) {
    return (
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
        Sin obras. Subí la primera desde "+ Nueva obra".
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
        {obras.map((obra) => (
          <div key={obra.id} className="py-4 flex items-center gap-5 group">
            {/* Thumbnail */}
            <div className="relative w-14 h-14 shrink-0 bg-[var(--color-surface)] overflow-hidden">
              {obra.imagen_url ? (
                <Image
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[8px] text-[var(--color-border)]">—</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-text)] truncate">
                {obra.titulo}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {[obra.series?.nombre, obra.tecnica, obra.año].filter(Boolean).join(" · ")}
              </p>
            </div>

            {/* Toggle publicada */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(obra.id, !obra.publicada)}
                disabled={isPending}
                className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-50 ${
                  obra.publicada ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                }`}
                title={obra.publicada ? "Publicada — click para ocultar" : "Oculta — click para publicar"}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--color-background)] transition-transform ${
                  obra.publicada ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
              <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] w-16">
                {obra.publicada ? "Visible" : "Oculta"}
              </span>
            </div>

            {/* Eliminar */}
            <button
              onClick={() => handleEliminar(obra.id, obra.titulo)}
              disabled={isPending}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-[0.15em] uppercase text-[var(--color-danger)] hover:opacity-70 disabled:opacity-30 shrink-0"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
