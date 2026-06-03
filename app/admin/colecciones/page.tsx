import Link from "next/link";

const COLECCIONES_MOCK = [
  { id: "1", nombre: "Introspecciones", año: "2022–2023", obras: 12, descripcion: "Exploración del espacio interior y la memoria." },
  { id: "2", nombre: "Materia y tiempo", año: "2021", obras: 8, descripcion: "Diálogo entre el soporte físico y la temporalidad." },
  { id: "3", nombre: "Planos", año: "2020–2021", obras: 15, descripcion: "Deconstrucción de la superficie pictórica." },
];

export default function ColeccionesAdminPage() {
  return (
    <div className="p-10 max-w-4xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
            Colecciones
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
            {COLECCIONES_MOCK.length} colecciones · las obras siempre pertenecen a una colección
          </p>
        </div>
        <Link
          href="/admin/colecciones/nueva"
          className="h-9 px-5 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase flex items-center hover:bg-[var(--color-text)] transition-colors"
        >
          + Nueva
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {COLECCIONES_MOCK.map((col) => (
          <div key={col.id} className="py-5 flex items-start justify-between gap-8 group">
            <div className="flex-1">
              <div className="flex items-baseline gap-4">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
                  {col.nombre}
                </p>
                <span className="text-xs text-[var(--color-muted)]">{col.año}</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-1">{col.descripcion}</p>
              <p className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mt-2">
                {col.obras} obras
              </p>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/admin/colecciones/${col.id}`}
                className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Editar
              </Link>
              <span className="text-[var(--color-border)]">·</span>
              <button className="text-xs tracking-[0.15em] uppercase text-[var(--color-danger)] hover:text-red-400 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
