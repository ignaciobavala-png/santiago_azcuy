"use client"

import { useRef, useState, useTransition } from "react"
import {
  getBannerSignedUploadUrl,
  crearBanner,
  toggleBanner,
  eliminarBanner,
  actualizarOrdenBanner,
} from "./actions"

export interface BannerRow {
  id: string
  titulo: string | null
  video_url: string
  poster_url: string | null
  orden: number | null
  activo: boolean
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const MAX = 500 * 1024 * 1024

export default function BannersPanel({ banners }: { banners: BannerRow[] }) {
  const [lista, setLista] = useState(banners)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (file: File) => {
    setError(null)
    if (file.size > MAX) {
      setError(`El archivo pesa ${formatBytes(file.size)}. El máximo es 500 MB.`)
      return
    }
    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan archivos de video (MP4, MOV, WebM).")
      return
    }

    setUploading(true)
    setProgress(0)
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4"
      const { signedUrl, publicUrl } = await getBannerSignedUploadUrl(ext)

      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
        xhr.onerror = () => reject(new Error("Error de red"))
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })

      const fd = new FormData()
      fd.set("video_url", publicUrl)
      fd.set("orden", String((lista.at(-1)?.orden ?? lista.length) + 1))
      await crearBanner(fd)
      window.location.reload()
    } catch (e) {
      setError(`Error al subir el video: ${String(e)}`)
    } finally {
      setUploading(false)
    }
  }

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      try {
        await toggleBanner(id, activo)
        setLista((prev) => prev.map((b) => (b.id === id ? { ...b, activo } : b)))
      } catch (e) {
        setError(String(e))
      }
    })
  }

  const handleOrden = (id: string, value: string) => {
    const orden = value === "" ? null : Number(value)
    setLista((prev) => prev.map((b) => (b.id === id ? { ...b, orden } : b)))
    startTransition(async () => {
      try {
        await actualizarOrdenBanner(id, orden)
      } catch (e) {
        setError(String(e))
      }
    })
  }

  const handleEliminar = (id: string) => {
    if (!confirm("¿Eliminar este video del fondo?")) return
    startTransition(async () => {
      try {
        await eliminarBanner(id)
        setLista((prev) => prev.filter((b) => b.id !== id))
      } catch (e) {
        setError(String(e))
      }
    })
  }

  const visibles = lista.filter((b) => b.activo).length

  return (
    <div>
      {error && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Uploader */}
      <div className="mb-8">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          {uploading ? `Subiendo ${progress}%…` : "+ Subir video de fondo"}
        </button>
        <p className="mt-2 text-[10px] text-[var(--color-muted)]">
          MP4 · MOV · WebM — máx. 500 MB. Se reproducen en bucle, sin sonido, rotando entre sí.
          Recomendado: vertical 1080×1920 para que se vea bien en celular.
        </p>
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
          Sin videos de fondo cargados.
        </p>
      ) : (
        <>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-3">
            {visibles} de {lista.length} visibles en el sitio
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lista.map((b) => (
              <div
                key={b.id}
                className={`border rounded-lg overflow-hidden group ${
                  b.activo ? "border-[var(--color-border)]" : "border-dashed border-[var(--color-border)] opacity-60"
                }`}
              >
                <div className="relative aspect-[9/16] bg-black">
                  <video
                    src={b.video_url}
                    poster={b.poster_url ?? undefined}
                    muted
                    playsInline
                    loop
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {b.titulo && (
                    <p className="text-xs text-[var(--color-text)] truncate">{b.titulo}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={b.orden ?? ""}
                      onChange={(e) => handleOrden(b.id, e.target.value)}
                      className={`${inputCls} h-7 w-16 py-0`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleToggle(b.id, !b.activo)}
                      disabled={isPending}
                      className={`text-[10px] tracking-[0.15em] uppercase ${
                        b.activo ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      {b.activo ? "Visible" : "Oculto"}
                    </button>
                    <button
                      onClick={() => handleEliminar(b.id)}
                      disabled={isPending}
                      className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
