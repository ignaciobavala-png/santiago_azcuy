"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { srcSet, url } from "@/lib/media";
import { ruta, type Lang } from "@/lib/i18n";
import type { Categoria, Obra } from "@/lib/tipos";

/**
 * Card del indice de Galeria: una por categoria, con las obras de esa
 * categoria pasando de a una detras del titulo. Es una vidriera, no un
 * carrusel navegable — entrar a la categoria ya lleva a la grilla completa,
 * asi que ac no hacen falta puntos ni controles.
 */
export function CategoriaCard({
  categoria,
  etiqueta,
  cuenta,
  obras,
  lang,
}: {
  categoria: Categoria;
  etiqueta: string;
  cuenta: number;
  obras: Obra[];
  lang: Lang;
}) {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    if (obras.length < 2) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % obras.length), 3200);
    return () => clearInterval(t);
  }, [obras.length]);

  return (
    <Link href={ruta(lang, `/galeria?categoria=${categoria}`)} className="group block">
      <figure className="relative aspect-[4/5] overflow-hidden bg-papel-alt">
        {obras.map((o, i) => (
          <img
            key={o.id}
            src={url(o.imagen, "md")}
            srcSet={srcSet(o.imagen)}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            alt=""
            aria-hidden={i !== activo}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03] ${
              i === activo ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </figure>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4">
        <span className="titular">{etiqueta}</span>
        <span className="etiqueta text-tinta-suave">{cuenta}</span>
      </figcaption>
    </Link>
  );
}
