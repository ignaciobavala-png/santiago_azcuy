import { notFound } from "next/navigation"
import Link from "next/link"
import { getObra, getObras } from "@/lib/supabase/queries"
import ImagenLightbox from "@/components/gallery/ImagenLightbox"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const obra = await getObra(slug)
  if (!obra) return {}
  return {
    title: `${obra.titulo} — Santiago Azcuy`,
    description: obra.descripcion?.slice(0, 160) ?? undefined,
  }
}

export default async function ObraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const obra = await getObra(slug)
  if (!obra) notFound()

  const ficha = [
    { label: "Técnica", value: obra.tecnica },
    { label: "Dimensiones", value: obra.dimensiones },
    { label: "Año", value: obra.año ? String(obra.año) : null },
    { label: "Serie", value: obra.series?.nombre ?? null },
  ].filter((f) => f.value)

  return (
    <>
      <div className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-10">
            <Link href="/obras" className="hover:text-[var(--color-text)] transition-colors">
              Pinturas
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">{obra.titulo}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

            {/* ── IMAGEN ──────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              {obra.imagen_url ? (
                <ImagenLightbox
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  blurDataURL={obra.blur_data_url ?? undefined}
                />
              ) : (
                <div className="relative w-full bg-[var(--color-surface)] flex items-center justify-center" style={{ aspectRatio: "1/1" }}>
                  <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
                    Imagen próximamente
                  </span>
                </div>
              )}
            </div>

            {/* ── INFO ────────────────────────────────────────── */}
            <div className="flex flex-col gap-10 pt-2">

              <div>
                {obra.series && (
                  <Link
                    href={`/series/${obra.series.slug}`}
                    className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3 block hover:opacity-70 transition-opacity"
                  >
                    {obra.series.nombre}
                  </Link>
                )}
                <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl leading-tight text-[var(--color-text)]">
                  {obra.titulo}
                </h1>
                {obra.año && (
                  <p className="text-[var(--color-muted)] mt-2 text-sm">{obra.año}</p>
                )}
              </div>

              {obra.descripcion && (
                <p className="font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[var(--color-text)]/80">
                  {obra.descripcion}
                </p>
              )}

              {ficha.length > 0 && (
                <div className="border-t border-[var(--color-border)] pt-8">
                  <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-5">
                    Ficha técnica
                  </p>
                  <dl className="flex flex-col gap-3">
                    {ficha.map(({ label, value }) => (
                      <div key={label} className="flex items-baseline gap-4">
                        <dt className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] w-28 shrink-0">
                          {label}
                        </dt>
                        <dd className="text-sm text-[var(--color-text)]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="border-t border-[var(--color-border)] pt-8">
                {obra.disponible ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
                        Disponible
                      </span>
                    </div>
                    {obra.precio && (
                      <p className="font-[family-name:var(--font-cormorant)] text-4xl text-[var(--color-text)]">
                        USD {Number(obra.precio).toLocaleString("es-AR")}
                      </p>
                    )}
                    <a
                      href={`https://wa.me/541151832983?text=${encodeURIComponent(`Hola, estoy interesado en esta obra: ${obra.titulo}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-12 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors duration-300"
                    >
                      Consultar galería
                    </a>
                    <p className="text-xs text-[var(--color-muted)]">
                      Incluye certificado de autenticidad. Envío a consultar.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
                      No disponible
                    </p>
                    <a
                      href={`https://wa.me/541151832983?text=${encodeURIComponent(`Hola, estoy interesado en esta obra: ${obra.titulo}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-12 px-8 border border-[var(--color-border)] text-[var(--color-muted)] text-xs tracking-[0.2em] uppercase hover:border-[var(--color-text)] hover:text-[var(--color-text)] transition-colors duration-300"
                    >
                      Consultar galería
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
