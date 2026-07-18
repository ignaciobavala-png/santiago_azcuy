import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import ObraCard from "@/components/gallery/ObraCard"
import { getSerie, getSeries } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const serie = await getSerie(slug)
  if (!serie) return {}
  return {
    title: `${serie.nombre} — Santiago Azcuy`,
    description: serie.descripcion ?? undefined,
  }
}

export default async function SeriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const serie = await getSerie(slug)
  if (!serie) notFound()

  return (
    <>
      <div className="pt-24 pb-24">

        {/* Header de la serie */}
        <div className="px-8 max-w-7xl mx-auto py-12 border-b border-[var(--color-border)]">
          <nav className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-10">
            <Link href="/series" className="hover:text-[var(--color-text)] transition-colors">
              Series
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">{serie.nombre}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {(serie.año_inicio || serie.año_fin) && (
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-4">
                  {serie.año_inicio}
                  {serie.año_fin && serie.año_fin !== serie.año_inicio
                    ? `–${serie.año_fin}`
                    : ""}
                </p>
              )}
              <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl text-[var(--color-text)] leading-tight">
                {serie.nombre}
              </h1>
              {serie.descripcion && (
                <p className="mt-6 text-base text-[var(--color-muted)] leading-relaxed max-w-lg font-[family-name:var(--font-cormorant)] text-xl">
                  {serie.descripcion}
                </p>
              )}
            </div>

            {serie.imagen_cover && (
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
                <Image
                  src={serie.imagen_cover}
                  alt={serie.nombre}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>

        {/* Grid de obras */}
        <div className="px-8 max-w-7xl mx-auto py-16">
          {serie.obras.length === 0 ? (
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
              Sin pinturas publicadas en esta serie.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {serie.obras.map((obra) => (
                <ObraCard key={obra.id} {...obra} />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
