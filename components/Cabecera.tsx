"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BotonIdioma, BotonTema } from "@/components/Herramientas";
import { ruta, t, type Diccionario, type Lang } from "@/lib/i18n";

const SECCIONES: { href: string; clave: keyof Diccionario["nav"] }[] = [
  { href: "/obras", clave: "obras" },
  { href: "/musica", clave: "musica" },
  { href: "/libro", clave: "libro" },
  { href: "/arquitectura", clave: "arquitectura" },
  { href: "/sobre", clave: "sobre" },
];

/**
 * Cliente por el menu movil. El panel tiene que quedar FUERA del <header>: un
 * backdrop-filter distinto de none convierte al elemento en bloque contenedor
 * de sus descendientes fixed, asi que dentro del header un `fixed inset-0` no
 * resolvia contra la ventana sino contra los 57px de la barra, y los enlaces
 * desbordaban encima de la pagina en vez de taparla.
 *
 * El panel va en z-40, debajo del header en z-50, para que la barra siga
 * arriba y el mismo boton sirva para cerrar.
 */
export function Cabecera({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [abierto, setAbierto] = useState(false);

  // Con el panel abierto el fondo no debe scrollear detras.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
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
      <header className="sticky top-0 z-50 border-b border-linea bg-papel/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-4 md:px-10">
          <Link href={ruta(lang, "/")} className="etiqueta shrink-0 hover:opacity-55">
            Santiago Azcuy
          </Link>

          <ul className="ml-auto hidden gap-8 md:flex">
            {SECCIONES.map((s) => (
              <li key={s.href}>
                <Link
                  href={ruta(lang, s.href)}
                  className="etiqueta whitespace-nowrap text-tinta-media transition-colors hover:text-tinta"
                >
                  {d.nav[s.clave]}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-3 md:ml-8 md:gap-4">
            <BotonTema etiqueta={d.nav.cambiarTema} />
            <span className="h-3.5 w-px bg-linea" aria-hidden />
            <BotonIdioma lang={lang} etiqueta={d.nav.cambiarIdioma} />

            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-label={abierto ? d.nav.cerrarMenu : d.nav.abrirMenu}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              className="grid h-8 w-8 place-items-center md:hidden"
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
          </div>
        </nav>
      </header>

      <div
        id="menu-movil"
        // `hidden` en vez de desmontar: la animacion de entrada de los enlaces
        // necesita que los nodos existan antes de que arranque.
        hidden={!abierto}
        className="fixed inset-0 z-40 bg-papel md:hidden"
      >
        {/* Cerrar al navegar se hace en el click y no en un efecto sobre el
            pathname: el click es la causa, y el panel se va antes de que empiece
            la transicion de ruta en vez de despues. */}
        <nav
          onClick={() => setAbierto(false)}
          className="flex h-full flex-col justify-between px-5 pt-24 pb-12"
        >
          <ul className="flex flex-col gap-2">
            {SECCIONES.map((s, i) => (
              <li key={s.href}>
                <Link
                  href={ruta(lang, s.href)}
                  tabIndex={abierto ? undefined : -1}
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
          <Link
            href={ruta(lang, "/contacto")}
            tabIndex={abierto ? undefined : -1}
            className="etiqueta text-tinta-media"
          >
            {d.nav.contacto}
          </Link>
        </nav>
      </div>
    </>
  );
}
