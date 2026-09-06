import Link from "next/link";
import { srcSet, url } from "@/lib/media";
import { ruta, type Lang } from "@/lib/i18n";
import { ficha, type Obra } from "@/lib/tipos";

/**
 * `sizes` cambia por contexto, asi que el navegador nunca baja el -lg de 270 KB
 * para una miniatura de grilla. Es la diferencia entre una home de 1 MB y una
 * de 200 KB, que con 5 GB/mes de egress importa.
 */
export function ObraCard({
  obra,
  lang,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw",
  prioridad = false,
}: {
  obra: Obra;
  lang: Lang;
  sizes?: string;
  prioridad?: boolean;
}) {
  return (
    <Link href={ruta(lang, `/obras/${obra.slug}`)} className="group block">
      <figure
        className="relative overflow-hidden bg-papel-alt"
        style={{ aspectRatio: `${obra.imagen_w} / ${obra.imagen_h}` }}
      >
        {obra.blur && (
          <img
            src={obra.blur}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl"
          />
        )}
        <img
          src={url(obra.imagen, "md")}
          srcSet={srcSet(obra.imagen)}
          sizes={sizes}
          alt={obra.titulo}
          width={obra.imagen_w}
          height={obra.imagen_h}
          loading={prioridad ? "eager" : "lazy"}
          fetchPriority={prioridad ? "high" : "auto"}
          decoding="async"
          className="relative h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.035]"
        />
      </figure>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4">
        <span className="text-[0.9375rem] leading-snug tracking-tight">
          {obra.titulo}
        </span>
        <span className="etiqueta shrink-0 text-tinta-suave">{obra.anio ?? ""}</span>
      </figcaption>
      <p className="mt-0.5 text-[0.8125rem] text-tinta-media">{ficha(obra)}</p>
    </Link>
  );
}
