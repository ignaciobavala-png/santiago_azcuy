"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaColeccionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    // TODO: conectar con Supabase
    await new Promise((r) => setTimeout(r, 800));
    router.push("/admin/colecciones");
  };

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">
          Colecciones
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Nueva colección
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Nombre" required>
          <input name="nombre" required placeholder="Ej: Introspecciones" className={inputCls} />
        </Field>

        <Field label="Año">
          <input name="año" placeholder="Ej: 2023 o 2022–2023" className={inputCls} />
        </Field>

        <Field label="Descripción">
          <textarea
            name="descripcion"
            rows={4}
            placeholder="Texto breve sobre esta colección..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Imagen de portada">
          <div className="border border-dashed border-[var(--color-border)] p-8 flex flex-col items-center justify-center gap-3 hover:border-[var(--color-muted)] transition-colors cursor-pointer">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-[var(--color-muted)]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
              Subir imagen
            </p>
            <p className="text-[10px] text-[var(--color-muted)]">JPG, PNG, WebP — máx. 20MB</p>
          </div>
        </Field>

        <Field label="Orden en el sitio">
          <input name="orden" type="number" min="1" placeholder="1" className={inputCls} />
        </Field>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Crear colección"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 border border-[var(--color-border)] text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
