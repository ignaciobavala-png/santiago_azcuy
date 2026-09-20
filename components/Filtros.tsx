import Link from "next/link";
import { ruta, type Diccionario, type Lang } from "@/lib/i18n";
import type { Categoria } from "@/lib/tipos";

/**
 * Ya adentro de una categoria: volver al indice de Galeria, o cruzarla con el
 * eje de encargo (un encargo puede ser figurativo o abstracto, asi que se
 * combinan en la URL en vez de excluirse).
 */
export function Filtros({
  lang,
  categoria,
  encargo,
  d,
}: {
  lang: Lang;
  categoria: Categoria;
  encargo: boolean;
  d: Diccionario["obras"];
}) {
  const chip = (activo: boolean) =>
    `etiqueta rounded-full border px-3.5 py-1.5 transition-colors ${
      activo
        ? "border-tinta bg-tinta text-papel"
        : "border-linea text-tinta-media hover:border-tinta-suave hover:text-tinta"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={ruta(lang, "/galeria")}
        className="etiqueta text-tinta-media transition-colors hover:text-tinta"
      >
        ‹ {d.todo}
      </Link>

      <span className="mx-1 h-4 w-px bg-linea" aria-hidden />

      <Link
        href={ruta(lang, `/galeria?categoria=${categoria}${encargo ? "" : "&encargo=1"}`)}
        className={chip(encargo)}
      >
        {d.porEncargo}
      </Link>
    </div>
  );
}
