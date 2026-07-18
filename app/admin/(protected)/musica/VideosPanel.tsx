"use client"

import { useRef, useState, useTransition } from "react"
import { crearVideo, toggleVideo, eliminarVideo } from "./actions"

export interface VideoRow {
  id: string
  youtube_id: string
  titulo: string | null
  orden: number | null
  activo: boolean
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

export default function VideosPanel({
  seccion,
  titulo,
  descripcion,
  videos,
}: {
  seccion: "videoclip" | "vivo"
  titulo: string
  descripcion: string
  videos: VideoRow[]
}) {
  const [lista, setLista] = useState(videos)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleCrear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("seccion", seccion)
    startTransition(async () => {
      try {
        await crearVideo(fd)
        formRef.current?.reset()
        // Recargar para traer el registro con su id/orden reales.
        window.location.reload()
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      try {
        await toggleVideo(id, activo)
        setLista((prev) => prev.map((v) => (v.id === id ? { ...v, activo } : v)))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const handleEliminar = (id: string) => {
    if (!confirm("¿Eliminar este video?")) return
    startTransition(async () => {
      try {
        await eliminarVideo(id)
        setLista((prev) => prev.filter((v) => v.id !== id))
      } catch (err) {
        setError(String(err))
      }
    })
  }

  return (
    <section className="border border-[var(--color-border)] rounded-lg p-6">
      <div className="mb-5">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          {titulo}
        </h2>
        <p className="text-xs text-[var(--color-muted)] mt-1">{descripcion}</p>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Alta */}
      <form ref={formRef} onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_5rem_auto] gap-3 items-end mb-6">
        <Field label="Link o ID de YouTube" required>
          <input name="youtube" required placeholder="https://youtube.com/watch?v=…" className={inputCls} />
        </Field>
        <Field label="Título (opcional)">
          <input name="titulo" placeholder="Nombre del video" className={inputCls} />
        </Field>
        <Field label="Orden">
          <input name="orden" type="number" placeholder="1" className={inputCls} />
        </Field>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          + Agregar
        </button>
      </form>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
          Sin videos cargados.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          {lista.map((v) => (
            <div key={v.id} className="py-3 flex items-center gap-4 group">
              <img
                src={`https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`}
                alt=""
                className="w-20 h-[45px] object-cover rounded shrink-0 border border-[var(--color-border)]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)] truncate">
                  {v.titulo || v.youtube_id}
                </p>
                <p className="text-[10px] text-[var(--color-muted)]">
                  {v.orden != null ? `Orden ${v.orden} · ` : ""}
                  {v.youtube_id}
                </p>
              </div>
              <button
                onClick={() => handleToggle(v.id, !v.activo)}
                disabled={isPending}
                className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded transition-colors ${
                  v.activo
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {v.activo ? "Visible" : "Oculto"}
              </button>
              <button
                onClick={() => handleEliminar(v.id)}
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
