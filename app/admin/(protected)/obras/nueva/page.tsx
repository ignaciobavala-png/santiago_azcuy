"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSignedUploadUrl, crearObra } from "../actions"
import { createClient } from "@/lib/supabase/client"

const MAX_PX = 2400      // px máximos por lado — suficiente para imprimir A2
const WEBP_QUALITY = 0.88 // ~85% equivalente en WebP

// Comprime y redimensiona via Canvas. Devuelve [blob optimizado, blur_data_url]
// TIFF no es soportado por Canvas en la mayoría de browsers → se sube sin comprimir
async function processImageClient(
  file: File
): Promise<{ blob: Blob; mimeType: string; blurDataUrl: string | null }> {
  const isTiff = file.type === "image/tiff"

  if (isTiff) {
    // TIFF: Canvas no lo soporta — subir original sin comprimir
    return { blob: file, mimeType: file.type, blurDataUrl: null }
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img

      // Escalar proporcional para no superar MAX_PX
      const scale = Math.min(1, MAX_PX / Math.max(w, h))
      const dw = Math.round(w * scale)
      const dh = Math.round(h * scale)

      // Canvas principal
      const canvas = document.createElement("canvas")
      canvas.width = dw
      canvas.height = dh
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, dw, dh)

      // Blur canvas 10×10
      const blurCanvas = document.createElement("canvas")
      blurCanvas.width = 10
      blurCanvas.height = 10
      blurCanvas.getContext("2d")!.drawImage(img, 0, 0, 10, 10)
      const blurDataUrl = blurCanvas.toDataURL("image/webp", 0.5)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob falló")); return }
          resolve({ blob, mimeType: "image/webp", blurDataUrl })
        },
        "image/webp",
        WEBP_QUALITY
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function NuevaObraPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [imagenUrl, setImagenUrl] = useState<string | null>(null)
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<string | null>(null)
  const [disponible, setDisponible] = useState(false)
  const [series, setSeries] = useState<{ id: string; nombre: string }[]>([])
  const [seriesLoaded, setSeriesLoaded] = useState(false)

  useState(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("series").select("id, nombre").order("orden")
      setSeries(data ?? [])
      setSeriesLoaded(true)
    }
    load()
  })

  const handleFile = async (file: File) => {
    if (!file) return
    setError(null)
    setUploadProgress(0)

    const MAX = 100 * 1024 * 1024
    if (file.size > MAX) {
      setError(`El archivo pesa ${formatBytes(file.size)}. El máximo es 100 MB.`)
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      // 1. Comprimir + redimensionar en browser (2400px max, WebP) y generar blur
      const { blob, mimeType, blurDataUrl } = await processImageClient(file)
      setBlurDataUrl(blurDataUrl)

      const isTiff = file.type === "image/tiff"
      const originalSize = formatBytes(file.size)
      const compressedSize = formatBytes(blob.size)
      setFileInfo(
        isTiff
          ? `${file.name} · ${originalSize} (TIFF — subido sin comprimir)`
          : `${file.name} · ${originalSize} → ${compressedSize} comprimido`
      )

      // 2. URL firmada (request liviano al servidor)
      const { signedUrl, publicUrl } = await getSignedUploadUrl()

      // 3. Subida directa a Supabase — no pasa por Vercel
      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
        xhr.onerror = () => reject(new Error("Error de red"))
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", mimeType)
        xhr.send(blob)
      })

      setImagenUrl(publicUrl)
    } catch (e) {
      setError(`Error al subir imagen: ${String(e)}`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!imagenUrl) { setError("Primero subí la imagen"); return }
    setSaving(true)
    setError(null)

    try {
      const fd = new FormData(e.currentTarget)
      fd.set("imagen_url", imagenUrl)
      fd.set("blur_data_url", blurDataUrl ?? "")
      fd.set("disponible", disponible ? "true" : "false")
      await crearObra(fd)
      router.push("/admin")
    } catch (e) {
      setError(`Error al guardar: ${String(e)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">Obras</p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Subir obra
        </h1>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Imagen */}
        <Field label="Imagen de la obra" required>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/tiff"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-3 hover:border-[var(--color-muted)] transition-colors cursor-pointer aspect-[3/4] max-h-72 overflow-hidden relative"
          >
            {preview ? (
              <>
                <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-text)]">
                      Subiendo… {uploadProgress}%
                    </p>
                    <div className="w-32 h-px bg-[var(--color-border)] relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[var(--color-accent)] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-[var(--color-muted)]">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">Subir imagen</p>
                <p className="text-[10px] text-[var(--color-muted)]">JPG · PNG · WebP · TIFF — máx. 100 MB</p>
              </>
            )}
          </button>

          {imagenUrl && !uploading && (
            <p className="text-[10px] text-[var(--color-accent)]">
              ✓ {fileInfo ?? "Imagen subida correctamente"}
            </p>
          )}
          {fileInfo && uploading && (
            <p className="text-[10px] text-[var(--color-muted)]">{fileInfo}</p>
          )}
        </Field>

        {/* Serie */}
        <Field label="Serie">
          <select name="serie_id" className={selectCls} disabled={!seriesLoaded}>
            <option value="">Sin serie</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Título" required>
            <input name="titulo" required placeholder="Sin título I" className={inputCls} />
          </Field>
          <Field label="Año">
            <input name="año" type="number" placeholder="2024" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Técnica">
            <input name="tecnica" placeholder="Óleo" className={inputCls} />
          </Field>
          <Field label="Dimensiones (cm)">
            <div className="flex items-center gap-2">
              <input name="alto" type="number" placeholder="Alto" className={inputCls} />
              <span className="text-[var(--color-muted)] shrink-0">×</span>
              <input name="ancho" type="number" placeholder="Ancho" className={inputCls} />
            </div>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea name="descripcion" rows={4} placeholder="Texto sobre la obra..." className={`${inputCls} resize-none`} />
        </Field>

        {/* Venta */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-5">Venta</p>

          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => setDisponible((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${disponible ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--color-background)] transition-transform ${disponible ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
              {disponible ? "Disponible para la venta" : "No disponible"}
            </span>
          </div>

          {disponible && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio (USD)">
                <input name="precio" type="number" placeholder="1800" className={inputCls} />
              </Field>
              <Field label="Tipo">
                <select name="tipo_venta" className={selectCls}>
                  <option value="original">Original</option>
                  <option value="print">Print</option>
                  <option value="ambos">Ambos</option>
                </select>
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving || uploading}
            className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar obra"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 border border-[var(--color-border)] text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

const selectCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
