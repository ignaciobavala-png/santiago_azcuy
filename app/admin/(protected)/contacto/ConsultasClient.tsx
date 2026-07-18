"use client"

import { marcarLeida, marcarNoLeida, eliminarConsulta, type Consulta } from "./actions"

export function ConsultasClient({
  consultas: initial,
  tipoLabel,
}: {
  consultas: Consulta[]
  tipoLabel: Record<string, string>
}) {
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return ""
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-1">
      {initial.map((c) => (
        <div
          key={c.id}
          className={`border ${
            c.leido ? "border-[var(--color-border)]" : "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
          } p-5`}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              {!c.leido && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5" />
              )}
              <div>
                <p className="text-sm text-[var(--color-text)] font-medium">{c.nombre}</p>
                <p className="text-xs text-[var(--color-muted)]">{c.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
                {tipoLabel[c.tipo_consulta] || c.tipo_consulta}
              </span>
              <span className="text-[10px] text-[var(--color-muted)]">
                {formatearFecha(c.created_at)}
              </span>
            </div>
          </div>

          {c.mensaje && (
            <p className="text-sm text-[var(--color-text)]/80 leading-relaxed mb-3 ml-5">
              {c.mensaje}
            </p>
          )}

          <div className="flex items-center gap-2 ml-5">
            <form action={c.leido ? marcarNoLeida.bind(null, c.id) : marcarLeida.bind(null, c.id)}>
              <button
                type="submit"
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {c.leido ? "Marcar no leída" : "Marcar leída"}
              </button>
            </form>
            <span className="text-[var(--color-border)]">|</span>
            <form action={eliminarConsulta.bind(null, c.id)}>
              <button
                type="submit"
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                Eliminar
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
