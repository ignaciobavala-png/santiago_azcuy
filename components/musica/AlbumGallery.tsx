import Image from "next/image"
import type { Album } from "@/lib/supabase/queries"

const PLATAFORMAS: { key: keyof Album; nombre: string; color: string }[] = [
  { key: "spotify_url", nombre: "Spotify", color: "#1DB954" },
  { key: "youtube_music_url", nombre: "YouTube Music", color: "#FF0033" },
  { key: "apple_music_url", nombre: "Apple Music", color: "#FA57C1" },
]

function AlbumCard({ album }: { album: Album }) {
  const links = PLATAFORMAS.map((p) => ({ ...p, url: album[p.key] as string | null })).filter(
    (p) => p.url && p.url !== "#"
  )

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {album.portada_url ? (
          <Image
            src={album.portada_url}
            alt={`Portada de ${album.titulo}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
              Sin portada
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)] leading-tight">
          {album.titulo}
        </h3>
        {album.año && (
          <span className="shrink-0 text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
            {album.año}
          </span>
        )}
      </div>

      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map(({ key, nombre, color, url }) => (
            <a
              key={key}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-text)]"
              style={{ borderColor: `${color}55` }}
            >
              {nombre}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AlbumGallery({ albumes }: { albumes: Album[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {albumes.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  )
}
