"use client"

import { useQueryState } from "nuqs"

interface Props {
  series: { slug: string; nombre: string }[]
  tecnicas: string[]
}

export default function FiltrosObras({ series, tecnicas }: Props) {
  const [serie, setSerie] = useQueryState("serie", { shallow: false })
  const [tecnica, setTecnica] = useQueryState("tecnica", { shallow: false })
  const [disponible, setDisponible] = useQueryState("disponible", { shallow: false })

  const btnBase =
    "text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border transition-colors duration-200"
  const btnActive =
    "border-[var(--color-accent)] text-[var(--color-accent)]"
  const btnInactive =
    "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-text)] hover:text-[var(--color-text)]"

  return (
    <div className="flex flex-wrap gap-6 items-start mb-14">
      {/* Serie */}
      {series.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mr-1">
            Serie
          </span>
          <button
            onClick={() => setSerie(null)}
            className={`${btnBase} ${!serie ? btnActive : btnInactive}`}
          >
            Todas
          </button>
          {series.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSerie(serie === s.slug ? null : s.slug)}
              className={`${btnBase} ${serie === s.slug ? btnActive : btnInactive}`}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Técnica */}
      {tecnicas.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)] mr-1">
            Técnica
          </span>
          <button
            onClick={() => setTecnica(null)}
            className={`${btnBase} ${!tecnica ? btnActive : btnInactive}`}
          >
            Todas
          </button>
          {tecnicas.map((t) => (
            <button
              key={t}
              onClick={() => setTecnica(tecnica === t ? null : t)}
              className={`${btnBase} ${tecnica === t ? btnActive : btnInactive}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Disponible */}
      <button
        onClick={() => setDisponible(disponible ? null : "true")}
        className={`${btnBase} ${disponible ? btnActive : btnInactive}`}
      >
        Solo disponibles
      </button>
    </div>
  )
}
