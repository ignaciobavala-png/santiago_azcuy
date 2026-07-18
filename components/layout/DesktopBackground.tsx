"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { Banner } from "@/lib/supabase/queries"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * "Escritorio": el banner vive acá como fondo permanente del sitio, detrás de
 * todo. No se desmonta al navegar — la sensación es que las secciones se abren
 * como ventanas transparentes sobre el mismo lugar.
 *
 * Rota entre los videos del pool en orden aleatorio (uno a la vez), igual que
 * el carrusel original. El scrim es liviano en el home (banner protagonista) y
 * algo más denso —pero translúcido— en las secciones, para que el fondo se
 * siga viendo a través de la "ventana".
 */
export default function DesktopBackground({ banners }: { banners: Banner[] }) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  // El SSR y el primer render del cliente usan el orden original (determinista)
  // para evitar hydration mismatch; recién montado se baraja la cola dejando el
  // primer video en su lugar, así la reproducción no se corta.
  const [orden, setOrden] = useState(banners)
  const [i, setI] = useState(0)

  useEffect(() => {
    setOrden(banners.length > 1 ? [banners[0], ...shuffle(banners.slice(1))] : banners)
  }, [banners])

  const actual = orden.length ? orden[i % orden.length] : null
  const next = () => setI((prev) => (prev + 1) % orden.length)

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      {actual ? (
        <video
          key={actual.id}
          src={actual.video_url}
          poster={actual.poster_url ?? undefined}
          autoPlay
          muted
          playsInline
          onEnded={next}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
      ) : (
        <div className="sky-glow absolute inset-0" />
      )}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isHome
            ? "bg-black/40"
            : "bg-[var(--color-background)]/68 backdrop-blur-[2px]"
        }`}
      />
    </div>
  )
}
