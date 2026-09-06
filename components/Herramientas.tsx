"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otro, ruta, sinPrefijo, type Lang } from "@/lib/i18n";

/**
 * El tema real lo fija el script inline del layout antes del primer pintado, y
 * la unica fuente de verdad es el atributo data-theme del <html>. Este boton no
 * guarda estado propio a proposito: si lo tuviera, en el primer render el
 * servidor no sabria que tema eligio el visitante y el icono aparecaria al
 * reves durante un frame. Que la mitad llena gire lo resuelve el CSS, que si
 * lee data-theme.
 */
export function BotonTema({ etiqueta }: { etiqueta: string }) {
  const alternar = () => {
    const raiz = document.documentElement;
    const siguiente = raiz.dataset.theme === "dark" ? "light" : "dark";
    raiz.dataset.theme = siguiente;
    try {
      localStorage.setItem("tema", siguiente);
    } catch {
      // Modo incognito o storage bloqueado: el tema vale para esta pagina y ya.
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      className="grid h-8 w-8 place-items-center text-tinta transition-opacity hover:opacity-55"
    >
      {/* Un circulo mitad lleno, que gira segun el tema. Sin libreria de iconos. */}
      <svg viewBox="0 0 20 20" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path className="tema-mitad" d="M10 1.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" />
      </svg>
    </button>
  );
}

/**
 * Conserva la pagina al cambiar de idioma: quien esta en /obras/pleyades pasa a
 * /en/obras/pleyades, no a la home. Los slugs no se traducen.
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
