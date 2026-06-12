"use client"

import { useState, useTransition } from "react"
import type { Tables } from "@/types/database"
import { guardarBiografia, crearExposicion, eliminarExposicion } from "./actions"

type Exposicion = Tables<"exposiciones">

interface Props {
  textoInicial: string
  fraseInicial: string
  exposiciones: Exposicion[]
}

export default function BiografiaForm({ textoInicial, fraseInicial, exposiciones: inicial }: Props) {
  const [texto, setTexto] = useState(textoInicial)
  const [frase, setFrase] = useState(fraseInicial)
  const [expos, setExpos] = useState(inicial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSaveBio = () => {
    setError(null)
    startTransition(async () => {
      try {
        await guardarBiografia(texto, frase)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } catch (e) {
        setError(String(e))
      }
    })
  }

  const handleCrearExposicion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await crearExposicion(fd)
        // Refresh local list optimistically
        const año = fd.get("año") as string
        setExpos((prev) => [
          {
            id: crypto.randomUUID(),
            titulo: fd.get("titulo") as string,
            lugar: (fd.get("lugar") as string) || null,
            ciudad: (fd.get("ciudad") as string) || null,
            pais: (fd.get("pais") as string) || null,
            tipo: (fd.get("tipo") as string) || null,
            fecha_inicio: año ? `${año}-01-01` : null,
            fecha_fin: null,
            url: null,
            created_at: null,
          },
          ...prev,
        ])
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
      } catch (e) {
        setError(String(e))
      }
    })
  }

  const handleEliminar = (id: string) => {
    startTransition(async () => {
      try {
        await eliminarExposicion(id)
        setExpos((prev) => prev.filter((e) => e.id !== id))
      } catch (e) {
        setError(String(e))
      }
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Frase destacada */}
      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
          Frase destacada
        </label>
        <p className="text-[10px] text-[var(--color-muted)]">
          Aparece en la sección principal del sitio, antes del pie de página.
        </p>
        <textarea
          value={frase}
          onChange={(e) => setFrase(e.target.value)}
          rows={3}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] leading-relaxed italic placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors resize-none"
          placeholder='"La pintura es el lenguaje con el que traduzco lo que las palabras no pueden alcanzar."'
        />
      </div>

      {/* Bio text */}
      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
          Texto biográfico
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={10}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] leading-relaxed placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors resize-none"
          placeholder="Escribí la biografía del artista..."
        />
        <button
          onClick={handleSaveBio}
          disabled={isPending}
          className="self-start h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : saved ? "✓ Guardado" : "Guardar"}
        </button>
      </div>

      {/* Exposiciones */}
      <div className="border-t border-[var(--color-border)] pt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)]">
            Exposiciones
          </p>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors"
          >
            {showForm ? "Cancelar" : "+ Agregar"}
          </button>
        </div>

        {/* Formulario nueva exposición */}
        {showForm && (
          <form onSubmit={handleCrearExposicion} className="mb-6 flex flex-col gap-4 p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <label className={labelCls}>Título *</label>
                <input name="titulo" required placeholder="Planos invisibles" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Lugar</label>
                <input name="lugar" placeholder="Galería Ruth Benzacar" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Ciudad</label>
                <input name="ciudad" placeholder="Buenos Aires" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>País</label>
                <input name="pais" placeholder="Argentina" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Año</label>
                <input name="año" type="number" placeholder="2024" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Tipo</label>
                <select name="tipo" className={inputCls}>
                  <option value="individual">Individual</option>
                  <option value="colectiva">Colectiva</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="self-start h-9 px-6 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Agregar exposición"}
            </button>
          </form>
        )}

        {/* Lista */}
        {expos.length === 0 ? (
          <p className="text-xs text-[var(--color-muted)]">Sin exposiciones cargadas.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {expos.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between group">
                <div>
                  <p className="text-sm text-[var(--color-text)]">{exp.titulo}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {[exp.lugar, exp.ciudad, exp.pais].filter(Boolean).join(" · ")}
                    {exp.fecha_inicio && ` · ${new Date(exp.fecha_inicio).getFullYear()}`}
                    {exp.tipo && (
                      <span className="ml-2 tracking-[0.1em] uppercase">{exp.tipo}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleEliminar(exp.id)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-[0.15em] uppercase text-[var(--color-danger)] hover:opacity-70 disabled:opacity-30"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls =
  "w-full bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"

const labelCls = "text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]"
