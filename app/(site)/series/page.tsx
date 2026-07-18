import Link from "next/link"
import Image from "next/image"
import { getSeries } from "@/lib/supabase/queries"

export const metadata = { title: "Series — Santiago Azcuy" }

export default async function SeriesPage() {
  const series = await getSeries()

  return (
    <>
      <div className="pt-24 pb-24 px-5 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
            Colecciones
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl sm:text-5xl md:text-6xl text-[var(--color-text)]">
            Series
          </h1>
        </div>

        {series.length === 0 ? (
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
            Próximamente.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {series.map((serie) => (
              <Link
                key={serie.id}
                href={`/series/${serie.slug}`}
                className="group grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 py-12 hover:opacity-80 transition-opacity"
              >
                {/* Cover */}
                <div className="relative aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
                  {serie.imagen_cover ? (
                    <Image
                      src={serie.imagen_cover}
                      alt={serie.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center gap-4">
                  <div>
                    {(serie.año_inicio || serie.año_fin) && (
                      <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
                        {serie.año_inicio}
                        {serie.año_fin && serie.año_fin !== serie.año_inicio
                          ? `–${serie.año_fin}`
                          : ""}
                      </p>
                    )}
                    <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                      {serie.nombre}
                    </h2>
                  </div>
                  {serie.descripcion && (
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-md">
                      {serie.descripcion}
                    </p>
                  )}
                  <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] border-b border-[var(--color-border)] pb-0.5 w-fit group-hover:text-[var(--color-text)] group-hover:border-[var(--color-text)] transition-colors">
                    Ver serie
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
