import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import HeroVideo from "@/components/layout/HeroVideo"
import GaleriaHome from "@/components/gallery/GaleriaHome"
import { getSeriesConObras, getHeroBanner, getFrase } from "@/lib/supabase/queries"

export default async function HomePage() {
  const [series, hero, bio] = await Promise.all([
    getSeriesConObras(20, 8),
    getHeroBanner(),
    getFrase(),
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
          </div>
        </section>

        {/* ── GALERÍA POR SERIES ──────────────────────────────── */}
        {series.length > 0 ? (
          <GaleriaHome series={series} />
        ) : (
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
        {bio && (
          <section className="px-8 py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-[family-name:var(--font-cormorant)] font-light text-2xl md:text-3xl leading-relaxed text-[var(--color-text)] italic">
                {bio}
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
        )}

      </main>
      <Footer />
    </>
  )
}
