"use client"

import { useState } from "react"
import Link from "next/link"
import ObraCard from "@/components/gallery/ObraCard"
import type { ObraCard as ObraCardType, Serie } from "@/lib/supabase/queries"

type SerieConObras = Serie & { obras: ObraCardType[] }

export default function GaleriaHome({ series }: { series: SerieConObras[] }) {
  const [activa, setActiva] = useState(0)
  const serie = series[activa]

  if (!serie) return null

  return (
    <section className="px-8 py-14 md:py-20 max-w-7xl mx-auto w-full">

      {/* ── TABS ────────────────────────────────────────────── */}
      <div className="flex items-end gap-8 border-b border-[var(--color-border)] overflow-x-auto mb-12 pb-0 scrollbar-none">
        {series.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiva(i)}
            className={`relative pb-4 text-xs tracking-[0.3em] uppercase transition-colors duration-300 whitespace-nowrap shrink-0 ${
              i === activa
                ? "text-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {s.nombre}
            <span
              className={`absolute bottom-0 left-0 right-0 h-px bg-[var(--color-text)] transition-opacity duration-300 ${
                i === activa ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── HEADER SERIE ────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          {(serie.año_inicio || serie.año_fin) && (
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">
              Colección · {serie.año_inicio}
              {serie.año_fin && serie.año_fin !== serie.año_inicio ? `–${serie.año_fin}` : ""}
            </p>
          )}
          {serie.descripcion && (
            <p className="text-sm text-[var(--color-muted)] max-w-md leading-relaxed">
              {serie.descripcion}
            </p>
          )}
        </div>
        <Link
          href={`/series/${serie.slug}`}
          className="hidden md:inline-flex shrink-0 ml-8 text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-b border-[var(--color-border)] pb-0.5 hover:border-[var(--color-text)]"
        >
          Ver serie completa
        </Link>
      </div>

      {/* ── GRID OBRAS ──────────────────────────────────────── */}
      <div key={activa} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 animate-fade-in">
        {serie.obras.map((obra) => (
          <ObraCard key={obra.id} {...obra} />
        ))}
      </div>

      {/* Ver serie — mobile */}
      <div className="mt-8 md:hidden">
        <Link
          href={`/series/${serie.slug}`}
          className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-b border-[var(--color-border)] pb-0.5"
        >
          Ver serie completa
        </Link>
      </div>

    </section>
  )
}
