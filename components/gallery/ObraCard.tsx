import Link from "next/link"
import Image from "next/image"
import type { ObraCard as ObraCardType } from "@/lib/supabase/queries"

export default function ObraCard({
  slug,
  titulo,
  año,
  tecnica,
  dimensiones,
  imagen_url,
  blur_data_url,
  disponible,
}: ObraCardType) {
  return (
    <Link href={`/obras/${slug}`} className="group block">
      <div className="relative overflow-hidden bg-[var(--color-surface)] aspect-[3/4]">
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 [@media(hover:hover)]:group-hover:scale-105"
            placeholder={blur_data_url ? "blur" : "empty"}
            blurDataURL={blur_data_url ?? undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
              Sin imagen
            </span>
          </div>
        )}

        {/* Overlay solo en dispositivos con hover real — no se activa en touch */}
        <div className="absolute inset-0 bg-black/55 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
          {tecnica && (
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)] mb-1">
              {tecnica}
            </p>
          )}
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

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-tight text-[var(--color-text)] [@media(hover:hover)]:group-hover:text-[var(--color-accent)] transition-colors">
            {titulo}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {año && <p className="text-xs text-[var(--color-muted)]">{año}</p>}
            {tecnica && <p className="text-xs text-[var(--color-muted)] hidden sm:block">· {tecnica}</p>}
          </div>
        </div>
        {disponible && (
          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        )}
      </div>
    </Link>
  )
}
