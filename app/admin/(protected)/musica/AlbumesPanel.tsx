"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { getSignedUploadUrl, crearAlbum, toggleAlbum, eliminarAlbum } from "./actions"

export interface AlbumRow {
  id: string
  titulo: string
  año: number | null
  portada_url: string | null
  spotify_url: string | null
  youtube_music_url: string | null
  apple_music_url: string | null
  orden: number | null
  activo: boolean
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

const MAX_PX = 1400

// Comprime la portada a WebP (máx 1400px por lado).
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
        0.9
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function AlbumesPanel({ albumes }: { albumes: AlbumRow[] }) {
  const [lista, setLista] = useState(albumes)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [portadaUrl, setPortadaUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const { blob, mimeType } = await processImage(file)
      const { signedUrl, publicUrl } = await getSignedUploadUrl()
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPortadaUrl(publicUrl)
    } catch (err) {
      setError(`Error al subir portada: ${String(err)}`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleCrear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("portada_url", portadaUrl ?? "")
    startTransition(async () => {
      try {
        await crearAlbum(fd)
        window.location.reload()
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      try {
        await toggleAlbum(id, activo)
        setLista((prev) => prev.map((a) => (a.id === id ? { ...a, activo } : a)))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleEliminar = (id: string) => {
    if (!confirm("¿Eliminar este álbum?")) return
    startTransition(async () => {
      try {
        await eliminarAlbum(id)
        setLista((prev) => prev.filter((a) => a.id !== id))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  return (
    <section className="border border-[var(--color-border)] rounded-lg p-6">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          Álbumes
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Portada, título, año y links a cada plataforma.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Alta */}
      <form ref={formRef} onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-[9rem_1fr] gap-5 mb-8 pb-8 border-b border-[var(--color-border)]">
        {/* Portada */}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative w-full aspect-square border border-dashed border-[var(--color-border)] rounded overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-[var(--color-muted)] transition-colors"
          >
            {preview ? (
              <Image src={preview} alt="Portada" fill className="object-cover" unoptimized />
            ) : (
              <>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-[var(--color-muted)]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">Portada</span>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text)]">Subiendo…</span>
              </div>
            )}
          </button>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_5rem] gap-3">
            <Field label="Título" required>
              <input name="titulo" required placeholder="Nombre del álbum" className={inputCls} />
            </Field>
            <Field label="Año">
              <input name="año" type="number" placeholder="2024" className={inputCls} />
            </Field>
            <Field label="Orden">
              <input name="orden" type="number" placeholder="1" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Spotify">
              <input name="spotify_url" placeholder="https://open.spotify.com/…" className={inputCls} />
            </Field>
            <Field label="YouTube Music">
              <input name="youtube_music_url" placeholder="https://music.youtube.com/…" className={inputCls} />
            </Field>
            <Field label="Apple Music">
              <input name="apple_music_url" placeholder="https://music.apple.com/…" className={inputCls} />
            </Field>
          </div>
          <div>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="h-9 px-6 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
            >
              + Agregar álbum
            </button>
          </div>
        </div>
      </form>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
          Sin álbumes cargados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lista.map((a) => (
            <div key={a.id} className="flex items-center gap-4 border border-[var(--color-border)] rounded p-3 group">
              <div className="relative w-14 h-14 rounded overflow-hidden shrink-0 bg-[var(--color-surface)]">
                {a.portada_url && (
                  <Image src={a.portada_url} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)] truncate">{a.titulo}</p>
                <p className="text-[10px] text-[var(--color-muted)]">
                  {a.año ?? "—"}
                  {a.orden != null ? ` · orden ${a.orden}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleToggle(a.id, !a.activo)}
                disabled={isPending}
                className={`text-[10px] tracking-[0.15em] uppercase ${a.activo ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}
              >
                {a.activo ? "Visible" : "Oculto"}
              </button>
              <button
                onClick={() => handleEliminar(a.id)}
                disabled={isPending}
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
        {label}
        {required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
