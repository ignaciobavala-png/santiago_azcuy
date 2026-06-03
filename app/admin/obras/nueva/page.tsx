"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COLECCIONES_MOCK = [
  { id: "1", nombre: "Introspecciones" },
  { id: "2", nombre: "Materia y tiempo" },
  { id: "3", nombre: "Planos" },
];

export default function NuevaObraPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [disponible, setDisponible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    // TODO: conectar con Supabase + sharp para procesar imagen
    await new Promise((r) => setTimeout(r, 800));
    router.push("/admin/colecciones");
  };

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">
          Obras
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Subir obra
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Imagen */}
        <Field label="Imagen de la obra" required>
          <div className="border border-dashed border-[var(--color-border)] p-12 flex flex-col items-center justify-center gap-3 hover:border-[var(--color-muted)] transition-colors cursor-pointer aspect-[3/4] max-h-64">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-[var(--color-muted)]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
            <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">Subir imagen</p>
            <p className="text-[10px] text-[var(--color-muted)]">JPG, PNG, WebP — máx. 20MB</p>
          </div>
        </Field>

        {/* Colección — obligatorio */}
        <Field label="Colección" required>
          <select name="coleccion_id" required className={selectCls}>
            <option value="">Seleccionar colección...</option>
            {COLECCIONES_MOCK.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <p className="text-[10px] text-[var(--color-muted)]">
            Toda obra pertenece a una colección.{" "}
            <a href="/admin/colecciones/nueva" className="underline hover:text-[var(--color-text)]">
              Crear nueva colección
            </a>
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Título" required>
            <input name="titulo" required placeholder="Sin título I" className={inputCls} />
          </Field>
          <Field label="Año">
            <input name="año" type="number" placeholder="2024" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Técnica">
            <input name="tecnica" placeholder="Óleo" className={inputCls} />
          </Field>
          <Field label="Soporte">
            <input name="soporte" placeholder="Tela de lino" className={inputCls} />
          </Field>
        </div>

        <Field label="Dimensiones">
          <div className="flex items-center gap-3">
            <input name="alto" type="number" placeholder="Alto (cm)" className={inputCls} />
            <span className="text-[var(--color-muted)] shrink-0">×</span>
            <input name="ancho" type="number" placeholder="Ancho (cm)" className={inputCls} />
          </div>
        </Field>

        <Field label="Descripción">
          <textarea name="descripcion" rows={4} placeholder="Texto sobre la obra..." className={`${inputCls} resize-none`} />
        </Field>

        {/* Venta */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-5">
            Venta
          </p>

          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => setDisponible((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${disponible ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--color-background)] transition-transform ${disponible ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
              {disponible ? "Disponible para la venta" : "No disponible"}
            </span>
          </div>

          {disponible && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Precio (USD)">
                <input name="precio" type="number" placeholder="1800" className={inputCls} />
              </Field>
              <Field label="Tipo">
                <select name="tipo_venta" className={selectCls}>
                  <option value="original">Original</option>
                  <option value="print">Print</option>
                  <option value="ambos">Ambos</option>
                </select>
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar obra"}
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

const selectCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-muted)] transition-colors";

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
