"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface Props {
  src: string
  alt: string
  blurDataURL?: string
}

export default function ImagenLightbox({ src, alt, blurDataURL }: Props) {
  const [abierto, setAbierto] = useState(false)

  const cerrar = useCallback(() => setAbierto(false), [])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [abierto, cerrar])

  return (
    <>
      {/* Contenedor de imagen clickeable */}
      <button
        onClick={() => setAbierto(true)}
        className="relative w-full bg-[var(--color-surface)] cursor-zoom-in block"
        style={{ aspectRatio: "1/1" }}
        aria-label="Ver imagen ampliada"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          priority
        />
        {/* Hint sutil */}
        <span className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] tracking-[0.15em] uppercase px-2 py-1 pointer-events-none">
          Ampliar
        </span>
      </button>

      {/* Lightbox */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={cerrar}
        >
          {/* Botón cerrar */}
          <button
            onClick={cerrar}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors text-3xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>

          {/* Imagen */}
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-6 pointer-events-none">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
            />
          </div>
        </div>
      )}
    </>
  )
}
