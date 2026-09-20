"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otro, ruta, sinPrefijo, type Lang } from "@/lib/i18n";

/**
 * Conserva la pagina al cambiar de idioma: quien esta en /galeria/pleyades pasa
 * a /en/galeria/pleyades, no a la home. Los slugs no se traducen.
 */
export function BotonIdioma({ lang, etiqueta }: { lang: Lang; etiqueta: string }) {
  const pathname = usePathname() ?? "/";
  const destino = ruta(otro(lang), sinPrefijo(pathname));

  return (
    <Link
      href={destino}
      hrefLang={otro(lang)}
      aria-label={etiqueta}
      className="etiqueta text-tinta transition-opacity hover:opacity-55"
    >
      {otro(lang).toUpperCase()}
    </Link>
  );
}
