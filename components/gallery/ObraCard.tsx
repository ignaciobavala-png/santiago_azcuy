import Link from "next/link";

interface ObraCardProps {
  slug: string;
  titulo: string;
  año: number;
  tecnica: string;
  dimensiones?: string;
  imagenUrl?: string;
  disponible?: boolean;
}

export default function ObraCard({
  slug,
  titulo,
  año,
  tecnica,
  dimensiones,
  imagenUrl,
  disponible,
}: ObraCardProps) {
  return (
    <Link href={`/obras/${slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--color-surface)] aspect-[3/4]">
        {imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagenUrl}
            alt={titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
              Sin imagen
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)] mb-1">
            {tecnica}
          </p>
          {dimensiones && (
            <p className="text-xs text-[var(--color-muted)]">{dimensiones}</p>
          )}
          {disponible && (
            <p className="mt-2 text-xs tracking-[0.15em] uppercase text-[var(--color-text)]">
              Disponible
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-tight text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {titulo}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">{año}</p>
        </div>
        {disponible && (
          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        )}
      </div>
    </Link>
  );
}
