"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { crearSerie } from "../actions"

export default function NuevaColeccionPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await crearSerie(fd)
        router.push("/admin/colecciones")
      } catch (err) {
        setError(String(err))
      }
    })
  }

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">Colecciones</p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Nueva colección
        </h1>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Nombre" required>
          <input name="nombre" required placeholder="Ej: Introspecciones" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Año inicio">
            <input name="año_inicio" type="number" placeholder="2022" className={inputCls} />
          </Field>
          <Field label="Año fin">
            <input name="año_fin" type="number" placeholder="2023" className={inputCls} />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            name="descripcion"
            rows={4}
            placeholder="Texto breve sobre esta colección..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Orden en el sitio">
          <input name="orden" type="number" min="1" placeholder="1" className={inputCls} />
        </Field>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Crear colección"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 border border-[var(--color-border)] text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
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
