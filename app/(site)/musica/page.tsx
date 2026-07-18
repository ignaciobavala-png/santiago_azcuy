import VideoGallery from "@/components/musica/VideoGallery"
import AlbumGallery from "@/components/musica/AlbumGallery"
import StreamingLinks from "@/components/musica/StreamingLinks"
import { getVideosMusica, getAlbumes, getPlataformas } from "@/lib/supabase/queries"

export const metadata = {
  title: "Música",
  description:
    "Música de Santiago Azcuy: videoclips, álbumes de estudio y presentaciones en vivo. Rock pop electrónico y mantras, disponibles en las plataformas de streaming.",
  alternates: { canonical: "/musica" },
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[var(--color-text)] mb-8 flex items-center gap-4">
      {children}
      <span className="h-px flex-1 bg-[var(--color-border)]" />
    </h2>
  )
}

function Proximamente({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
      <p className="text-xs tracking-[0.25em] uppercase text-[var(--color-muted)]">
        {children}
      </p>
    </div>
  )
}

export default async function MusicaPage() {
  const [videoclips, albumes, plataformas, envivo] = await Promise.all([
    getVideosMusica("videoclip"),
    getAlbumes(),
    getPlataformas(),
    getVideosMusica("vivo"),
  ])

  const videoclipItems = videoclips.map((v) => ({ id: v.id, youtube_id: v.youtube_id, titulo: v.titulo }))
  const envivoItems = envivo.map((v) => ({ id: v.id, youtube_id: v.youtube_id, titulo: v.titulo }))

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-8 pt-16 pb-24">
      <div className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
          Sonido
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl sm:text-5xl md:text-6xl text-[var(--color-text)]">
          Música
        </h1>
      </div>

      {/* ── VIDEOCLIPS ───────────────────────────────────────── */}
      <section id="videoclips" data-subsection className="mb-20 scroll-mt-32">
        <SectionTitle>Videoclips</SectionTitle>
        {videoclipItems.length > 0 ? (
          <VideoGallery videos={videoclipItems} />
        ) : (
          <Proximamente>Videoclips próximamente</Proximamente>
        )}
      </section>

      {/* ── ÁLBUMES ──────────────────────────────────────────── */}
      <section id="albumes" data-subsection className="mb-20 scroll-mt-32">
        <SectionTitle>Álbumes</SectionTitle>
        {albumes.length > 0 ? (
          <AlbumGallery albumes={albumes} />
        ) : (
          <Proximamente>Álbumes próximamente</Proximamente>
        )}
      </section>

      {/* ── PLATAFORMAS ──────────────────────────────────────── */}
      <section id="plataformas" data-subsection className="mb-20 scroll-mt-32">
        <SectionTitle>Plataformas</SectionTitle>
        <StreamingLinks plataformas={plataformas} />
      </section>

      {/* ── EN VIVO ──────────────────────────────────────────── */}
      <section id="envivo" data-subsection className="scroll-mt-32">
        <SectionTitle>En vivo</SectionTitle>
        {envivoItems.length > 0 ? (
          <VideoGallery videos={envivoItems} />
        ) : (
          <Proximamente>Presentaciones en vivo próximamente</Proximamente>
        )}
      </section>
    </div>
  )
}
