"use client";

import { useState } from "react";

export default function ContactoAdminPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-10 max-w-xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Contacto
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Información de contacto pública
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <Field label="Email público">
          <input defaultValue="santiago@azcuy.art" type="email" className={inputCls} />
        </Field>
        <Field label="Teléfono / WhatsApp">
          <input defaultValue="+54 9 11 0000-0000" className={inputCls} />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-5">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">Redes sociales</p>
          <div className="flex flex-col gap-4">
            <Field label="Instagram">
              <div className="flex">
                <span className="bg-[var(--color-border)] border border-r-0 border-[var(--color-border)] px-3 flex items-center text-xs text-[var(--color-muted)]">
                  instagram.com/
                </span>
                <input defaultValue="santiagoazcuy" className={`${inputCls} flex-1`} />
              </div>
            </Field>
            <Field label="Facebook">
              <div className="flex">
                <span className="bg-[var(--color-border)] border border-r-0 border-[var(--color-border)] px-3 flex items-center text-xs text-[var(--color-muted)]">
                  facebook.com/
                </span>
                <input defaultValue="" placeholder="usuario" className={`${inputCls} flex-1`} />
              </div>
            </Field>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-5">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">Texto de contacto</p>
          <Field label="Mensaje en la página de contacto">
            <textarea
              rows={3}
              defaultValue="Para consultas sobre obras, adquisiciones o exposiciones, escribí a:"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">{label}</label>
      {children}
    </div>
  );
}
