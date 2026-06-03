"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { uploadObraImage, crearObra } from "../actions"
import { createClient } from "@/lib/supabase/client"

export default function NuevaObraPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [imagenUrl, setImagenUrl] = useState<string | null>(null)
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disponible, setDisponible] = useState(false)
  const [series, setSeries] = useState<{ id: string; nombre: string }[]>([])
  const [seriesLoaded, setSeriesLoaded] = useState(false)

  // Carga series al montar
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
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append("imagen", file)
      const result = await uploadObraImage(fd)
      setImagenUrl(result.imagen_url)
      setBlurDataUrl(result.blur_data_url)
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
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-text)]">
                      Procesando…
                    </p>
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
                <p className="text-[10px] text-[var(--color-muted)]">JPG · PNG · WebP · TIFF — máx. 20MB</p>
                <p className="text-[10px] text-[var(--color-muted)]">Se convierte a WebP 2400px automáticamente</p>
              </>
            )}
          </button>
          {imagenUrl && !uploading && (
            <p className="text-[10px] text-[var(--color-accent)]">✓ Imagen subida correctamente</p>
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
