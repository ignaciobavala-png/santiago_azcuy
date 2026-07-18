"use client"

import { useState, useTransition } from "react"
import {
  crearPlataforma,
  actualizarPlataforma,
  togglePlataforma,
  eliminarPlataforma,
} from "./actions"

export interface PlataformaRow {
  id: string
  nombre: string
  url: string | null
  orden: number | null
  activo: boolean
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

export default function PlataformasPanel({ plataformas }: { plataformas: PlataformaRow[] }) {
  const [lista, setLista] = useState(plataformas)
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(plataformas.map((p) => [p.id, p.url ?? ""]))
  )
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleGuardar = (id: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await actualizarPlataforma(id, drafts[id] ?? "")
        setLista((prev) => prev.map((p) => (p.id === id ? { ...p, url: drafts[id] || null } : p)))
        setSavedId(id)
        setTimeout(() => setSavedId(null), 1500)
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      try {
        await togglePlataforma(id, activo)
        setLista((prev) => prev.map((p) => (p.id === id ? { ...p, activo } : p)))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleEliminar = (id: string) => {
    if (!confirm("¿Eliminar esta plataforma?")) return
    startTransition(async () => {
      try {
        await eliminarPlataforma(id)
        setLista((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleCrear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await crearPlataforma(fd)
        window.location.reload()
      } catch (err) {
        setError(String(err))
      }
    })
  }

  return (
    <section className="border border-[var(--color-border)] rounded-lg p-6">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          Plataformas
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Perfiles del artista para el bloque «Escuchar en…». Pegá la URL de cada perfil.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="flex flex-col divide-y divide-[var(--color-border)] mb-6">
        {lista.map((p) => (
          <div key={p.id} className="py-3 flex items-center gap-3 group">
            <span className="w-32 shrink-0 text-sm text-[var(--color-text)]">{p.nombre}</span>
            <input
              value={drafts[p.id] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
              placeholder="https://…"
              className={inputCls}
            />
            <button
              onClick={() => handleGuardar(p.id)}
              disabled={isPending}
              className="shrink-0 h-9 px-4 border border-[var(--color-border)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors disabled:opacity-50"
            >
              {savedId === p.id ? "✓" : "Guardar"}
            </button>
            <button
              onClick={() => handleToggle(p.id, !p.activo)}
              disabled={isPending}
              className={`shrink-0 text-[10px] tracking-[0.15em] uppercase ${p.activo ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}
            >
              {p.activo ? "Visible" : "Oculto"}
            </button>
            <button
              onClick={() => handleEliminar(p.id)}
              disabled={isPending}
              className="shrink-0 text-[10px] tracking-[0.15em] uppercase text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Alta de plataforma nueva */}
      <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-[10rem_1fr_5rem_auto] gap-3 items-end pt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">Nombre *</label>
          <input name="nombre" required placeholder="Bandcamp" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">URL</label>
          <input name="url" placeholder="https://…" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">Orden</label>
          <input name="orden" type="number" placeholder="4" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          + Agregar
        </button>
      </form>
    </section>
  )
}
