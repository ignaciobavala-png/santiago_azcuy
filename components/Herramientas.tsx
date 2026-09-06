"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { otro, ruta, sinPrefijo, t, type Diccionario, type Lang } from "@/lib/i18n";

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

/**
 * En movil la nav no entra: cinco secciones en una fila obligaban a scroll
 * horizontal, que nadie descubre. Va como panel a pantalla completa.
 */
export function Burger({
  lang,
  secciones,
}: {
  lang: Lang;
  secciones: { href: string; clave: keyof Diccionario["nav"] }[];
}) {
  // El diccionario no se puede pasar como prop: tiene funciones de formato y
  // React no serializa funciones hacia un componente cliente. Se resuelve aca.
  const d = t(lang);
  const [abierto, setAbierto] = useState(false);

  // Con el panel abierto el fondo no debe scrollear detras.
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? d.nav.cerrarMenu : d.nav.abrirMenu}
        aria-expanded={abierto}
        className="relative z-[60] grid h-8 w-8 place-items-center md:hidden"
      >
        <span className="relative block h-[10px] w-[19px]">
          <span
            className="absolute left-0 block h-px w-full bg-tinta transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
            style={{ transform: abierto ? "translateY(5px) rotate(45deg)" : "none" }}
          />
          <span
            className="absolute left-0 bottom-0 block h-px w-full bg-tinta transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
            style={{ transform: abierto ? "translateY(-4px) rotate(-45deg)" : "none" }}
          />
        </span>
      </button>

      <div
        // `hidden` en vez de desmontar: la transicion de entrada necesita que el
        // nodo exista antes de que cambie la opacidad.
        hidden={!abierto}
        className="fixed inset-0 z-50 bg-papel md:hidden"
      >
        {/* Cerrar al navegar se hace aca y no en un efecto sobre el pathname:
            el click es la causa, y de paso el panel se va antes de que empiece
            la transicion de ruta en vez de despues. */}
        <nav
          onClick={() => setAbierto(false)}
          className="flex h-full flex-col justify-between px-5 pt-24 pb-12"
        >
          <ul className="flex flex-col gap-2">
            {secciones.map((s, i) => (
              <li key={s.href}>
                <Link
                  href={ruta(lang, s.href)}
                  className="titular block py-1.5 hover:opacity-55"
                  style={{
                    animation: abierto
                      ? `entrar .5s cubic-bezier(.16,1,.3,1) ${i * 45}ms both`
                      : undefined,
                  }}
                >
                  {d.nav[s.clave]}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={ruta(lang, "/contacto")} className="etiqueta text-tinta-media">
            {d.nav.contacto}
          </Link>
        </nav>
      </div>
    </>
  );
}
