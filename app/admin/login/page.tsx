"use client"

import { useActionState } from "react"
import { signIn } from "./actions"

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.3em] uppercase text-[var(--color-muted)]">
            Santiago Azcuy
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)] mt-1">
            Panel de control
          </h1>
          <div className="mt-4 w-8 h-px bg-[var(--color-accent)] mx-auto" />
        </div>

        <form action={action} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-muted)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm outline-none focus:border-[var(--color-muted)] transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-[var(--color-danger)] tracking-[0.1em]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 h-11 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center">
          <a
            href="/"
            className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>

      </div>
    </main>
  )
}
