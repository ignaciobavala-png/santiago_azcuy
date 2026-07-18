"use client"

import { useState, useCallback } from "react"
import { guardarSeccionDossier, type SeccionDossier } from "./actions"

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

function findSeccion(secciones: SeccionDossier[], slug: string) {
  return secciones.find((s) => s.slug === slug)?.datos
}

export function DossierAdmin({ secciones }: { secciones: SeccionDossier[] }) {
  return (
    <div className="flex flex-col gap-16">
      <PortadaPanel secciones={secciones} />
      <TextoPanel secciones={secciones} />
      <CapitulosPanel secciones={secciones} />
      <CitaPanel secciones={secciones} />
    </div>
  )
}

function PanelHeader({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-[family-name:var(--font-cormorant)] font-light text-2xl text-[var(--color-text)]">{titulo}</h2>
      <p className="text-xs text-[var(--color-muted)] mt-1">{descripcion}</p>
    </div>
  )
}

function PortadaPanel({ secciones }: { secciones: SeccionDossier[] }) {
  const datos = findSeccion(secciones, "portada") as Record<string, string> | undefined
  const [eyebrow, setEyebrow] = useState(datos?.eyebrow ?? "Dossier de proceso")
  const [titulo, setTitulo] = useState(datos?.titulo ?? "Espiral Virtuosa")
  const [subtitulo, setSubtitulo] = useState(datos?.subtitulo ?? "Santiago Azcuy")
  const [marca, setMarca] = useState(datos?.marca ?? "Azemy")
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionDossier("portada", {
        eyebrow: eyebrow.trim(),
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim(),
        marca: marca.trim(),
      })
    } finally {
      setSaving(false)
    }
  }, [eyebrow, titulo, subtitulo, marca])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Portada" descripcion="Pagina 01 — Titulo y presentacion" />
      <div className="flex flex-col gap-4">
        <Field label="Eyebrow">
          <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Titulo">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Subtitulo (artista)">
          <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Marca / firma">
          <input value={marca} onChange={(e) => setMarca(e.target.value)} className={inputCls} />
        </Field>
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function TextoPanel({ secciones }: { secciones: SeccionDossier[] }) {
  const datos = findSeccion(secciones, "texto") as { parrafos?: string[] } | undefined
  const [parrafos, setParrafos] = useState<string[]>(datos?.parrafos ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      const filtrados = parrafos.map(p => p.trim()).filter(Boolean)
      await guardarSeccionDossier("texto", { parrafos: filtrados })
    } finally {
      setSaving(false)
    }
  }, [parrafos])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Texto conceptual" descripcion="Pagina 02 — Cuerpo del dossier" />
      <div className="flex flex-col gap-3 mb-4">
        {parrafos.map((p, i) => (
          <div key={i} className="flex gap-3 items-start">
            <textarea
              value={p}
              onChange={(e) => {
                const next = [...parrafos]
                next[i] = e.target.value
                setParrafos(next)
              }}
              rows={3}
              className={`${inputCls} resize-none`}
            />
            <button
              type="button"
              onClick={() => setParrafos(parrafos.filter((_, j) => j !== i))}
              className="shrink-0 text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] mt-3"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setParrafos([...parrafos, ""])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar parrafo
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function CapitulosPanel({ secciones }: { secciones: SeccionDossier[] }) {
  const datos = findSeccion(secciones, "capitulos") as {
    items?: { numero: string; titulo: string; subtitulo: string; imagen_url?: string }[]
  } | undefined
  const [items, setItems] = useState(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionDossier("capitulos", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Capitulos" descripcion="Paginas 03 a 11 — Desarrollo del proceso" />
      <div className="flex flex-col gap-4 mb-4">
        {items.map((cap, i) => (
          <div key={i} className="border border-[var(--color-border)] p-4 flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <input
                value={cap.numero}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], numero: e.target.value }
                  setItems(next)
                }}
                placeholder="03"
                className={`${inputCls} w-20`}
              />
              <input
                value={cap.titulo}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], titulo: e.target.value }
                  setItems(next)
                }}
                placeholder="Del concepto al boceto"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)]"
              >
                ✕
              </button>
            </div>
            <Field label="Subtitulo">
              <input
                value={cap.subtitulo}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], subtitulo: e.target.value }
                  setItems(next)
                }}
                placeholder="Primeros trazos..."
                className={inputCls}
              />
            </Field>
            <Field label="URL de imagen (opcional)">
              <input
                value={cap.imagen_url ?? ""}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], imagen_url: e.target.value || undefined }
                  setItems(next)
                }}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setItems([...items, { numero: "", titulo: "", subtitulo: "" }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar capitulo
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function CitaPanel({ secciones }: { secciones: SeccionDossier[] }) {
  const datos = findSeccion(secciones, "cita") as Record<string, string> | undefined
  const [cita, setCita] = useState(datos?.cita ?? "")
  const [firma, setFirma] = useState(datos?.firma ?? "Santiago Gerardo Azcuy")
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionDossier("cita", {
        cita: cita.trim(),
        firma: firma.trim(),
      })
    } finally {
      setSaving(false)
    }
  }, [cita, firma])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Cita final" descripcion="Pagina 12 — Cierre del dossier" />
      <div className="flex flex-col gap-4">
        <Field label="Texto de la cita">
          <textarea
            value={cita}
            onChange={(e) => setCita(e.target.value)}
            rows={6}
            className={`${inputCls} resize-none`}
          />
        </Field>
        <Field label="Firma">
          <input value={firma} onChange={(e) => setFirma(e.target.value)} className={inputCls} />
        </Field>
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
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
      className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
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
