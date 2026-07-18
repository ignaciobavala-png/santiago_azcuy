"use client"

import { useRef, useState } from "react"
import { SECTION_TREE } from "@/components/layout/sectionTree"
import { getCardImageSignedUploadUrl, setHomeCardImage } from "./actions"

const MAX_PX = 1200
const WEBP_QUALITY = 0.85

async function processImage(file: File): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, MAX_PX / Math.max(w, h))
      const dw = Math.round(w * scale)
      const dh = Math.round(h * scale)
      const canvas = document.createElement("canvas")
      canvas.width = dw
      canvas.height = dh
      canvas.getContext("2d")!.drawImage(img, 0, 0, dw, dh)
      canvas.toBlob(
        (blob) => (blob ? resolve({ blob, mimeType: "image/webp" }) : reject(new Error("toBlob falló"))),
        "image/webp",
        WEBP_QUALITY
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function CardSlot({
  href,
  label,
  imagenUrl,
  onChange,
}: {
  href: string
  label: string
  imagenUrl: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const { blob, mimeType } = await processImage(file)
      const { signedUrl, publicUrl } = await getCardImageSignedUploadUrl()
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await setHomeCardImage(href, publicUrl)
      onChange(publicUrl)
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleQuitar = async () => {
    if (!confirm(`¿Quitar la foto de "${label}"?`)) return
    setBusy(true)
    setError(null)
    try {
      await setHomeCardImage(href, null)
      onChange(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-muted)] disabled:opacity-50"
      >
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagenUrl} alt={`Foto de ${label}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] px-2 text-center">
            {busy ? "Subiendo…" : "Sin foto"}
          </span>
        )}
        {imagenUrl && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] tracking-[0.2em] uppercase text-white opacity-0 transition-opacity group-hover:opacity-100">
            {busy ? "Subiendo…" : "Cambiar"}
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-text)] truncate">{label}</p>
        {imagenUrl && (
          <button
            type="button"
            onClick={handleQuitar}
            disabled={busy}
            className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-danger)] hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            Quitar
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-[10px] text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}

export default function HomeCardsPanel({ images }: { images: Record<string, string> }) {
  const [map, setMap] = useState(images)

  return (
    <section className="border border-[var(--color-border)] rounded-lg p-6">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          Fotos de las cards
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          La imagen que muestra cada card del escritorio (home). Hacé click en una card para
          subir o cambiar su foto. Si una card no tiene foto, usa el fotograma del video de fondo.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {SECTION_TREE.map((node) => (
          <CardSlot
            key={node.href}
            href={node.href}
            label={node.label}
            imagenUrl={map[node.href] ?? null}
            onChange={(url) =>
              setMap((prev) => {
                const next = { ...prev }
                if (url) next[node.href] = url
                else delete next[node.href]
                return next
              })
            }
          />
        ))}
      </div>
    </section>
  )
}
