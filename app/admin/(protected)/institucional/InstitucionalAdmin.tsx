"use client"

import { useState, useCallback } from "react"
import { guardarSeccionInstitucional, type SeccionInstitucional } from "./actions"

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

function findSeccion(secciones: SeccionInstitucional[], slug: string) {
  return secciones.find((s) => s.slug === slug)?.datos
}

export function InstitucionalAdmin({ secciones }: { secciones: SeccionInstitucional[] }) {
  return (
    <div className="flex flex-col gap-16">
      <SemblanzaPanel secciones={secciones} />
      <SintesisPanel secciones={secciones} />
      <DistincionesPanel secciones={secciones} />
      <TrayectoriaPanel secciones={secciones} />
      <FormacionPanel secciones={secciones} />
      <ObrasClavePanel secciones={secciones} />
    </div>
  )
}

function PanelHeader({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-[family-name:var(--font-cormorant)] font-light text-2xl text-[var(--color-text)]">
        {titulo}
      </h2>
      <p className="text-xs text-[var(--color-muted)] mt-1">{descripcion}</p>
    </div>
  )
}

function SemblanzaPanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "semblanza") as Record<string, string> | undefined
  const [titulo, setTitulo] = useState(datos?.titulo ?? "")
  const [texto, setTexto] = useState(datos?.texto ?? "")
  const [texto2, setTexto2] = useState(datos?.texto_secundario ?? "")
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("semblanza", {
        titulo: titulo.trim(),
        texto: texto.trim(),
        texto_secundario: texto2.trim(),
      })
    } finally {
      setSaving(false)
    }
  }, [titulo, texto, texto2])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Semblanza" descripcion="Perfil profesional del artista" />
      <div className="flex flex-col gap-4">
        <Field label="Titulo del perfil">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Parrafo principal">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Parrafo secundario">
          <textarea value={texto2} onChange={(e) => setTexto2(e.target.value)} rows={5} className={`${inputCls} resize-none`} />
        </Field>
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function SintesisPanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "sintesis") as { items?: { valor: string; detalle: string }[] } | undefined
  const [items, setItems] = useState<{ valor: string; detalle: string }[]>(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("sintesis", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Sintesis" descripcion="Numeros destacados (4 items)" />
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              value={item.valor}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], valor: e.target.value }
                setItems(next)
              }}
              placeholder="+15"
              className={`${inputCls} w-32`}
            />
            <input
              value={item.detalle}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], detalle: e.target.value }
                setItems(next)
              }}
              placeholder="anos de produccion..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
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
          onClick={() => setItems([...items, { valor: "", detalle: "" }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar item
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function DistincionesPanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "distinciones") as { items?: { ano: string; texto: string }[] } | undefined
  const [items, setItems] = useState<{ ano: string; texto: string }[]>(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("distinciones", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Distinciones y premios" descripcion="Lista de reconocimientos" />
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              value={item.ano}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], ano: e.target.value }
                setItems(next)
              }}
              placeholder="2025"
              className={`${inputCls} w-24`}
            />
            <input
              value={item.texto}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], texto: e.target.value }
                setItems(next)
              }}
              placeholder="Segundo Premio..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
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
          onClick={() => setItems([...items, { ano: "", texto: "" }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar distincion
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function TrayectoriaPanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "trayectoria") as {
    items?: { ano: string; nota?: string; eventos: { titulo: string; lugar: string; pais?: string }[] }[]
  } | undefined
  const [items, setItems] = useState(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("trayectoria", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Trayectoria" descripcion="Exposiciones y participaciones por ano" />
      <div className="flex flex-col gap-8">
        {items.map((anio, iAnio) => (
          <div key={iAnio} className="border border-[var(--color-border)] p-5">
            <div className="flex gap-3 items-center mb-4">
              <input
                value={anio.ano}
                onChange={(e) => {
                  const next = [...items]
                  next[iAnio] = { ...next[iAnio], ano: e.target.value }
                  setItems(next)
                }}
                placeholder="2026"
                className={`${inputCls} w-24`}
              />
              <input
                value={anio.nota ?? ""}
                onChange={(e) => {
                  const next = [...items]
                  next[iAnio] = { ...next[iAnio], nota: e.target.value || undefined }
                  setItems(next)
                }}
                placeholder="Nota (opcional)"
                className={`${inputCls} w-48`}
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, j) => j !== iAnio))}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)]"
              >
                Eliminar ano
              </button>
            </div>

            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-3">Eventos</p>
            <div className="flex flex-col gap-3 ml-4">
              {anio.eventos.map((ev, iEv) => (
                <div key={iEv} className="flex gap-3 items-start">
                  <input
                    value={ev.titulo}
                    onChange={(e) => {
                      const next = [...items]
                      next[iAnio].eventos[iEv] = { ...next[iAnio].eventos[iEv], titulo: e.target.value }
                      setItems(next)
                    }}
                    placeholder="Titulo del evento"
                    className={inputCls}
                  />
                  <input
                    value={ev.lugar}
                    onChange={(e) => {
                      const next = [...items]
                      next[iAnio].eventos[iEv] = { ...next[iAnio].eventos[iEv], lugar: e.target.value }
                      setItems(next)
                    }}
                    placeholder="Lugar"
                    className={inputCls}
                  />
                  <input
                    value={ev.pais ?? ""}
                    onChange={(e) => {
                      const next = [...items]
                      next[iAnio].eventos[iEv] = { ...next[iAnio].eventos[iEv], pais: e.target.value || undefined }
                      setItems(next)
                    }}
                    placeholder="Pais"
                    className={`${inputCls} w-28`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...items]
                      next[iAnio].eventos = next[iAnio].eventos.filter((_, j) => j !== iEv)
                      setItems(next)
                    }}
                    className="shrink-0 text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] mt-3"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const next = [...items]
                  next[iAnio].eventos = [...next[iAnio].eventos, { titulo: "", lugar: "", pais: undefined }]
                  setItems(next)
                }}
                className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
              >
                + Agregar evento
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setItems([...items, { ano: "", eventos: [] }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar ano
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function FormacionPanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "formacion") as { items?: { titulo: string; detalle: string }[] } | undefined
  const [items, setItems] = useState<{ titulo: string; detalle: string }[]>(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("formacion", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Formacion" descripcion="Formacion academica y campos de estudio" />
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              value={item.titulo}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], titulo: e.target.value }
                setItems(next)
              }}
              placeholder="Arquitectura"
              className={`${inputCls} w-48`}
            />
            <input
              value={item.detalle}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], detalle: e.target.value }
                setItems(next)
              }}
              placeholder="Cursando 3er ano..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
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
          onClick={() => setItems([...items, { titulo: "", detalle: "" }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar item
        </button>
      </div>
      <div className="mt-4">
        <SaveButton saving={saving} onSave={guardar} />
      </div>
    </section>
  )
}

function ObrasClavePanel({ secciones }: { secciones: SeccionInstitucional[] }) {
  const datos = findSeccion(secciones, "obras_clave") as { items?: { titulo: string; ficha: string }[] } | undefined
  const [items, setItems] = useState<{ titulo: string; ficha: string }[]>(datos?.items ?? [])
  const [saving, setSaving] = useState(false)

  const guardar = useCallback(async () => {
    setSaving(true)
    try {
      await guardarSeccionInstitucional("obras_clave", { items: [...items] })
    } finally {
      setSaving(false)
    }
  }, [items])

  return (
    <section className="border-t border-[var(--color-border)] pt-10">
      <PanelHeader titulo="Obras clave" descripcion="Coleccion privada destacada" />
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              value={item.titulo}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], titulo: e.target.value }
                setItems(next)
              }}
              placeholder="Andromeda"
              className={`${inputCls} w-48`}
            />
            <input
              value={item.ficha}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], ficha: e.target.value }
                setItems(next)
              }}
              placeholder="Oleo y acrilico · 250x120 cm"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
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
          onClick={() => setItems([...items, { titulo: "", ficha: "" }])}
          className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)]"
        >
          + Agregar obra
        </button>
      </div>
      <div className="mt-4">
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
