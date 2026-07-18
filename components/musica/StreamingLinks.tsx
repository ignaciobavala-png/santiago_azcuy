import type { Plataforma } from "@/lib/supabase/queries"

/** Íconos de marca + color, mapeados por nombre de plataforma. */
const MARCAS: Record<string, { color: string; icon: React.ReactNode }> = {
  spotify: {
    color: "#1DB954",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.35.22.46.68.25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 1 1-.54-1.8c4.37-1.32 9.79-.68 13.49 1.6.44.27.58.85.31 1.29zm.13-3.4C15.24 8.34 8.83 8.12 5.1 9.25a1.13 1.13 0 1 1-.65-2.16c4.28-1.3 11.36-1.05 15.85 1.61a1.13 1.13 0 0 1-1.16 1.93z" />
      </svg>
    ),
  },
  "youtube music": {
    color: "#FF0033",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zM9.6 8.4l6 3.6-6 3.6z" />
      </svg>
    ),
  },
  "apple music": {
    color: "#FA57C1",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7">
        <path d="M23.997 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.5 10.5 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4C2.06.86 1.093 1.75.558 3.107c-.183.464-.276.95-.323 1.443-.04.402-.06.803-.06 1.207-.003 4.163-.003 8.326-.003 12.49 0 .422.017.843.06 1.263.09.912.354 1.767.99 2.454.786.85 1.766 1.29 2.906 1.402.505.05 1.014.06 1.522.06 3.87.003 7.74.003 11.61 0 .437 0 .873-.017 1.305-.077.906-.126 1.716-.475 2.38-1.113.786-.756 1.19-1.703 1.297-2.777.05-.5.06-1.004.06-1.508.003-4.05 0-8.1-.003-12.15zM18.5 8.86c0 .5-.003 1-.003 1.5v6.03c0 .43-.06.85-.27 1.24-.32.6-.83.94-1.5 1.02-.38.04-.76.06-1.13-.02-.63-.14-1.06-.55-1.2-1.19-.16-.72.13-1.44.79-1.8.28-.16.6-.24.92-.3.36-.06.72-.12 1.08-.2.3-.06.45-.24.46-.55V9.9c0-.24-.13-.4-.37-.36-.6.1-1.2.22-1.8.34l-2.62.53c-.3.06-.44.24-.44.55v6.5c0 .48-.05.96-.28 1.4-.32.6-.83.93-1.49 1.01-.38.04-.76.06-1.14-.03-.62-.14-1.05-.56-1.18-1.19-.16-.73.14-1.46.82-1.82.3-.16.62-.24.95-.3.35-.06.7-.12 1.05-.2.31-.06.45-.24.46-.56V6.9c0-.4.2-.63.58-.71l6.36-1.28c.4-.08.68.15.68.55.01 1.13.01 2.27.01 3.4z" />
      </svg>
    ),
  },
}

const ICONO_GENERICO = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7">
    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
  </svg>
)

export default function StreamingLinks({ plataformas }: { plataformas: Plataforma[] }) {
  const visibles = plataformas.filter((p) => p.url && p.url !== "#")

  if (visibles.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Enlaces de streaming próximamente.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {visibles.map(({ id, nombre, url }) => {
        const marca = MARCAS[nombre.trim().toLowerCase()]
        return (
          <a
            key={id}
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25"
          >
            <span
              className="shrink-0 text-[var(--color-muted)] transition-colors duration-300"
              style={marca ? { color: marca.color } : undefined}
            >
              {marca?.icon ?? ICONO_GENERICO}
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-muted)]">
                Escuchar en
              </span>
              <span className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--color-text)] transition-colors duration-300 group-hover:text-white">
                {nombre}
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              className="ml-auto h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-text)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M7 17L17 7M17 7H9M17 7v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )
      })}
    </div>
  )
}
