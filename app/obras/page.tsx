import { Suspense } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ObraCard from "@/components/gallery/ObraCard"
import FiltrosObras from "@/components/gallery/FiltrosObras"
import { getObras, getSeries, getTecnicas } from "@/lib/supabase/queries"

export const metadata = { title: "Obras — Santiago Azcuy" }

interface Props {
  searchParams: Promise<{ serie?: string; tecnica?: string; disponible?: string }>
}

export default async function ObrasPage({ searchParams }: Props) {
  const params = await searchParams

  const [obras, series, tecnicas] = await Promise.all([
    getObras({
      serie: params.serie,
      tecnica: params.tecnica,
      disponible: params.disponible === "true" ? true : undefined,
    }),
    getSeries(),
    getTecnicas(),
  ])

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24 px-8 max-w-7xl mx-auto w-full">
        <div className="mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
            Catálogo
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl text-[var(--color-text)]">
            Obras
          </h1>
        </div>

        <Suspense>
          <FiltrosObras
            series={series.map((s) => ({ slug: s.slug, nombre: s.nombre }))}
            tecnicas={tecnicas}
          />
        </Suspense>

        {obras.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
              No hay obras publicadas{params.serie || params.tecnica || params.disponible ? " con estos filtros" : ""}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {obras.map((obra) => (
              <ObraCard key={obra.id} {...obra} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
