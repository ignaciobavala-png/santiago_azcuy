"use client";

import { useState } from "react";

const BIO_MOCK = `Santiago Azcuy nació en Buenos Aires en 1982. Su práctica pictórica se desarrolla en torno a la exploración de la materia, el tiempo y la memoria. A través de capas sucesivas de óleo y técnicas mixtas, construye superficies que oscilan entre lo visible y lo latente.

Su obra ha sido exhibida en galerías y espacios culturales de Argentina, España y Estados Unidos. Actualmente trabaja en su estudio en el barrio de San Telmo, Buenos Aires.`;

const EXPOSICIONES_MOCK = [
  { id: "1", titulo: "Planos invisibles", lugar: "Galería Ruth Benzacar", ciudad: "Buenos Aires", año: "2023", tipo: "individual" },
  { id: "2", titulo: "Sur", lugar: "Espacio de Arte Contemporáneo", ciudad: "Madrid", año: "2022", tipo: "colectiva" },
  { id: "3", titulo: "Materia viva", lugar: "MAMBA", ciudad: "Buenos Aires", año: "2021", tipo: "colectiva" },
];

export default function BiografiaAdminPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Biografía
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Texto del artista y exposiciones
        </p>
      </div>

      {/* Bio text */}
      <div className="flex flex-col gap-2 mb-8">
        <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
          Texto biográfico
        </label>
        <textarea
          defaultValue={BIO_MOCK}
          rows={10}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text)] leading-relaxed placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors resize-none"
        />
      </div>

      {/* Exposiciones */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
            Exposiciones
          </label>
          <button className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors">
            + Agregar
          </button>
        </div>
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          {EXPOSICIONES_MOCK.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between group">
              <div>
                <p className="text-sm text-[var(--color-text)]">{exp.titulo}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {exp.lugar} · {exp.ciudad} · {exp.año}
                  <span className="ml-2 tracking-[0.1em] uppercase">{exp.tipo}</span>
                </p>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-[0.15em] uppercase">
                <button className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">Editar</button>
                <button className="text-[var(--color-danger)]">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}
