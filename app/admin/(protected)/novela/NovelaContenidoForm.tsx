"use client"

import { useState, useCallback } from "react"
import { guardarNovelaContenido, type NovelaContenido } from "./actions"

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

export function NovelaContenidoForm({ contenido }: { contenido: NovelaContenido | null }) {
  const [titulo, setTitulo] = useState(contenido?.titulo ?? "")
  const [subtitulo, setSubtitulo] = useState(contenido?.subtitulo ?? "")
  const [descripcion, setDescripcion] = useState(contenido?.descripcion ?? "")
  const [portadaUrl, setPortadaUrl] = useState(contenido?.portada_url ?? "")
  const [spotifyId, setSpotifyId] = useState(contenido?.spotify_show_id ?? "")
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarNovelaContenido({
        titulo: titulo.trim() || null,
        subtitulo: subtitulo.trim() || null,
        descripcion: descripcion.trim() || null,
        portada_url: portadaUrl.trim() || null,
        spotify_show_id: spotifyId.trim() || null,
      })
    } finally {
      setSaving(false)
    }
  }, [titulo, subtitulo, descripcion, portadaUrl, spotifyId])

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-[family-name:var(--font-cormorant)] font-light text-2xl text-[var(--color-text)] mb-1">
        Contenido de la pagina
      </h2>
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mb-2">
        Edita lo que se muestra en /el-aprendiz. Deja vacio para usar el contenido por defecto.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Titulo">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="El Aprendiz"
            className={inputCls}
          />
        </Field>
        <Field label="Subtitulo">
          <input
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            placeholder="Ciudad Intradorada"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Descripcion">
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          placeholder="Una travesia iniciatica..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="URL de la portada">
          <input
            value={portadaUrl}
            onChange={(e) => setPortadaUrl(e.target.value)}
            placeholder="/el-aprendiz/portada.webp"
            className={inputCls}
          />
        </Field>
        <Field label="Spotify Show ID">
          <input
            value={spotifyId}
            onChange={(e) => setSpotifyId(e.target.value)}
            placeholder="0JkEQKy6kGJk1ykfn9Jg8U"
            className={inputCls}
          />
        </Field>
      </div>

      <SaveButton saving={saving} onSave={guardar} />
    </div>
  )
}

function SaveButton({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  const [saved, setSaved] = useState(false)

  const handleClick = async () => {
    await onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className="h-10 px-8 self-start bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
    >
      {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">{label}</label>
      {children}
    </div>
  )
}
