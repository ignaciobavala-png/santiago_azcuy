"use client"

import { useState } from "react"

export type VideoItem = { id: string; youtube_id: string; titulo: string | null }

function VideoCard({ video, index }: { video: VideoItem; index: number }) {
  const [play, setPlay] = useState(false)
  const label = video.titulo || `Video ${index + 1}`

  return (
    <div className="group relative aspect-video overflow-hidden rounded-xl border border-[var(--color-border)] bg-black transition-all duration-500 hover:border-[var(--color-accent-2)]/70 hover:shadow-[0_12px_40px_-12px_rgba(134,197,202,0.5)]">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
          title={`${label} — Santiago Azcuy`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          aria-label={`Reproducir ${label}`}
          className="absolute inset-0 h-full w-full"
        >
          {/* Miniatura de YouTube */}
          <img
            src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 transition-colors duration-500 group-hover:from-black/40" />
          {video.titulo && (
            <span className="absolute inset-x-0 bottom-0 p-3 text-left font-[family-name:var(--font-cormorant)] text-lg text-white drop-shadow">
              {video.titulo}
            </span>
          )}
          {/* Botón play */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/40 backdrop-blur-sm text-white transition-all duration-500 group-hover:scale-110 group-hover:border-[var(--color-accent-2)] group-hover:text-[var(--color-accent-2)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-[2px]" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

export default function VideoGallery({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} index={i} />
      ))}
    </div>
  )
}
