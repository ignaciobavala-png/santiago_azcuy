"use client"

import { useActionState, useEffect } from "react"
import { solicitarNovela } from "./actions"

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"

export default function DescargaNovela() {
  const [state, formAction, pending] = useActionState(solicitarNovela, null)

  // Al obtener el signed URL, disparar la descarga automáticamente
  useEffect(() => {
    if (state?.ok && state.url) {
      window.location.href = state.url
    }
  }, [state])

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
          ¡Gracias! Tu descarga está por comenzar.
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          Si no arranca automáticamente,{" "}
          <a
            href={state.url}
            className="text-[var(--color-accent)] underline underline-offset-4"
          >
            descargá el PDF acá
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          autoComplete="email"
          className={inputCls}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 px-6 whitespace-nowrap bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
        >
          {pending ? "Preparando..." : "Descargar gratis"}
        </button>
      </div>
      {state && !state.ok && (
        <p className="text-xs text-[var(--color-danger)] tracking-wide">{state.error}</p>
      )}
      <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)]">
        Te enviamos el PDF a cambio de tu email. Sin spam.
      </p>
    </form>
  )
}
