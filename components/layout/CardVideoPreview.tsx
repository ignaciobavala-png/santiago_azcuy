"use client"

import { useRef, useState } from "react"
import type { Banner } from "@/lib/supabase/queries"

/**
 * Preview de card: muestra el poster del banner y reproduce el video
 * (muteado, en loop) al pasar el mouse. No descarga el video hasta el hover.
 */
export default function CardVideoPreview({ banner }: { banner: Banner | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    const v = videoRef.current
    if (!v || !banner) return
    if (!v.src) v.src = banner.video_url
    v.play().then(() => setPlaying(true)).catch(() => {})
  }

  const stop = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    setPlaying(false)
  }

  if (!banner) {
    return <div className="absolute inset-0 bg-black/35" />
  }

  return (
    <div className="absolute inset-0" onMouseEnter={play} onMouseLeave={stop}>
      {banner.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.poster_url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        poster={banner.poster_url ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}
