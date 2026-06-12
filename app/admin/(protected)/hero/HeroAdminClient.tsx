"use client"

import { useRef, useState } from "react"
import { getHeroSignedUploadUrl, guardarHeroBanner } from "./actions"

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function HeroAdminClient({ currentVideoUrl }: { currentVideoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileInfo, setFileInfo] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFile = async (file: File) => {
    if (!file) return
    setError(null)
    setSuccess(false)

    const MAX = 500 * 1024 * 1024
    if (file.size > MAX) {
      setError(`El archivo pesa ${formatBytes(file.size)}. El máximo es 500 MB.`)
      return
    }

    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan archivos de video (MP4, MOV, WebM).")
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    setFileInfo(`${file.name} · ${formatBytes(file.size)}`)
    setUploading(true)
    setProgress(0)

    try {
      const { signedUrl, publicUrl } = await getHeroSignedUploadUrl()

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

      setVideoUrl(publicUrl)
    } catch (e) {
      setError(`Error al subir el video: ${String(e)}`)
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await guardarHeroBanner(videoUrl)
      setSuccess(true)
    } catch (e) {
      setError(`Error al guardar: ${String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await guardarHeroBanner(null)
      setVideoUrl(null)
      setPreviewUrl(null)
      setFileInfo(null)
      setSuccess(true)
    } catch (e) {
      setError(`Error al eliminar: ${String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  const displayUrl = previewUrl ?? videoUrl

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">Configuración</p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Hero Banner
        </h1>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Video de fondo que se muestra en la sección principal del sitio.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-accent)] text-xs text-[var(--color-accent)]">
          Guardado correctamente.
        </div>
      )}

      {/* Preview */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mb-3">
          {displayUrl ? "Video actual" : "Sin video configurado"}
        </p>

        {displayUrl ? (
          <div className="relative aspect-video bg-black border border-[var(--color-border)] overflow-hidden">
            <video
              key={displayUrl}
              src={displayUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-text)]">
                  Subiendo… {progress}%
                </p>
                <div className="w-48 h-px bg-[var(--color-border)] relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--color-accent)] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {fileInfo && (
                  <p className="text-[10px] text-[var(--color-muted)]">{fileInfo}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] flex items-center justify-center">
            <div className="text-center">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="mx-auto mb-3 text-[var(--color-muted)]">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">Sin video</p>
            </div>
          </div>
        )}

        {videoUrl && !uploading && fileInfo && (
          <p className="text-[10px] text-[var(--color-accent)] mt-2">✓ {fileInfo}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || saving}
          className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          {uploading ? `Subiendo ${progress}%…` : "Subir video"}
        </button>

        {videoUrl && videoUrl !== currentVideoUrl && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="h-10 px-8 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-accent)] hover:text-[var(--color-background)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Publicar cambios"}
          </button>
        )}

        {videoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving || uploading}
            className="h-10 px-6 border border-[var(--color-border)] text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] transition-colors disabled:opacity-50"
          >
            Quitar video
          </button>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-muted)] leading-relaxed">
          Formatos aceptados: MP4 · MOV · WebM — máx. 500 MB<br />
          El video se reproduce en bucle, sin sonido, como fondo del hero principal.<br />
          Resolución recomendada: 1920×1080 (horizontal) o 1080×1920 (vertical para mobile).
        </p>
      </div>
    </div>
  )
}
