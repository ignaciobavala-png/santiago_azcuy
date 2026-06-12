import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ObraCard from "@/components/gallery/ObraCard"
import HeroVideo from "@/components/layout/HeroVideo"
import { getSeriesConObras, getHeroBanner } from "@/lib/supabase/queries"

export default async function HomePage() {
  const [series, hero] = await Promise.all([
    getSeriesConObras(3, 3),
    getHeroBanner(),
  ])
  const heroVideoUrl = hero?.activo && hero.video_url ? hero.video_url : null

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-8 text-center overflow-hidden">
          {heroVideoUrl && <HeroVideo src={heroVideoUrl} />}
          {heroVideoUrl && <div className="absolute inset-0 bg-black/50" />}

          <div className="relative z-10 flex flex-col items-center">
            <Image
              src="/logo-altacalidad.png"
              alt="Santiago Azcuy"
              width={480}
              height={160}
              className="w-[32rem] md:w-[48rem] h-auto object-contain brightness-0 invert"
              priority
            />
            <div className="mt-8 w-12 h-px bg-[var(--color-accent)] mx-auto" />
            <p className="mt-8 text-xs tracking-[0.25em] uppercase text-[var(--color-muted)]">
              Buenos Aires · Argentina
            </p>
          </div>

          <div className="absolute bottom-10 z-10 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">Explorar</span>
            <div className="w-px h-8 bg-[var(--color-muted)]" />
          </div>
        </section>

        {/* ── OBRA POR SERIE ──────────────────────────────────── */}
        {series.length > 0 ? (
          series.map((serie, idx) => (
            <section
              key={serie.id}
              className={`px-8 py-24 max-w-7xl mx-auto w-full ${idx > 0 ? "border-t border-[var(--color-border)]" : ""}`}
            >
              <div className="flex items-end justify-between mb-10">
                <div>
                  {(serie.año_inicio || serie.año_fin) && (
                    <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">
                      Colección · {serie.año_inicio}
                      {serie.año_fin && serie.año_fin !== serie.año_inicio ? `–${serie.año_fin}` : ""}
                    </p>
                  )}
                  <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)]">
                    {serie.nombre}
                  </h2>
                  {serie.descripcion && (
                    <p className="text-sm text-[var(--color-muted)] mt-2 max-w-md">{serie.descripcion}</p>
                  )}
                </div>
                <Link
                  href={`/series/${serie.slug}`}
                  className="hidden md:inline-flex text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-b border-[var(--color-border)] pb-0.5 hover:border-[var(--color-text)]"
                >
                  Ver serie
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {serie.obras.map((obra) => (
                  <ObraCard key={obra.id} {...obra} />
                ))}
              </div>
            </section>
          ))
        ) : (
          /* Estado vacío — cuando no hay obras en BD todavía */
          <section className="px-8 py-24 max-w-7xl mx-auto w-full">
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <div className="w-8 h-px bg-[var(--color-border)]" />
              <Link
                href="/obras"
                className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Ver obras
              </Link>
            </div>
          </section>
        )}

        {/* ── STATEMENT ───────────────────────────────────────── */}
        <section className="px-8 py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-[family-name:var(--font-cormorant)] font-light text-2xl md:text-3xl leading-relaxed text-[var(--color-text)] italic">
              "La pintura es el lenguaje con el que traduzco lo que las palabras
              no pueden alcanzar."
            </p>
            <div className="mt-8 w-8 h-px bg-[var(--color-accent)] mx-auto" />
            <Link
              href="/sobre"
              className="mt-6 inline-block text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Sobre el artista
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
