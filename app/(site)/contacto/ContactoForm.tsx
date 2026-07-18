"use client"

import { useActionState } from "react"
import { enviarConsulta } from "./actions"

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"

export function ContactoForm() {
  const [state, formAction, pending] = useActionState(enviarConsulta, null)

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          ¡Gracias por tu mensaje!
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          Te responderemos a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre *">
          <input type="text" name="nombre" required placeholder="Tu nombre" className={inputCls} />
        </Field>
        <Field label="Email *">
          <input type="email" name="email" required placeholder="tu@email.com" className={inputCls} />
        </Field>
      </div>

      <Field label="Motivo">
        <select name="tipo_consulta" className={inputCls}>
          <option value="general">Consulta general</option>
          <option value="compra">Adquisición de obra</option>
          <option value="prensa">Prensa</option>
        </select>
      </Field>

      <Field label="Mensaje *">
        <textarea
          name="mensaje"
          required
          rows={5}
          placeholder="Escribí tu consulta..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {state && !state.ok && (
        <p className="text-xs text-[var(--color-danger)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-12 px-8 self-start bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
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
