"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BotonIdioma } from "@/components/Herramientas";
import { ruta, type Diccionario, type Lang } from "@/lib/i18n";

/**
 * Encargos va al final y con un carrito: es la unica seccion del menu que es
 * "comprar" y no "ver", y el orden se lo marca ese matiz.
 */
const SECCIONES: { href: string; clave: keyof Diccionario["nav"]; carrito?: boolean }[] = [
  { href: "/galeria", clave: "obras" },
  { href: "/musica", clave: "musica" },
  { href: "/libro", clave: "libro" },
  { href: "/arquitectura", clave: "arquitectura" },
  { href: "/sobre", clave: "sobre" },
  { href: "/encargos", clave: "encargos", carrito: true },
];

/** Un carrito simple, del mismo trazo fino que el resto de los iconos de la barra. */
function IconoCarrito() {
  return (
    <svg viewBox="0 0 20 20" className="h-[0.8em] w-[0.8em]" aria-hidden>
      <path
        d="M1.5 2h2l1.9 9.6a1.6 1.6 0 0 0 1.57 1.29h6.6a1.6 1.6 0 0 0 1.57-1.3L17 5.5H4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="16.5" r="1.15" fill="currentColor" />
      <circle cx="14" cy="16.5" r="1.15" fill="currentColor" />
    </svg>
  );
}

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
export function Cabecera({ lang, nav }: { lang: Lang; nav: Diccionario["nav"] }) {
  const [abierto, setAbierto] = useState(false);
  // La firma ya esta en el hero de la home: repetirla en su propia barra
  // duplicaria la marca en la misma pantalla. En el resto de las secciones es
  // el unico camino de vuelta.
  const enHome = usePathname() === ruta(lang, "/");

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
        <nav className="mx-auto flex h-[calc(var(--alto-barra)-1px)] max-w-[1600px] items-center gap-6 px-5 md:px-10">
          {/* La firma repite la del hero para poder volver a la home desde
              cualquier seccion sin depender del boton "atras"; en la home ya
              esta en el hero, asi que aca no se repite. */}
          {!enHome && (
            <Link href={ruta(lang, "/")} aria-label="Santiago Azcuy">
              <span className="firma block h-6 text-tinta" aria-hidden />
            </Link>
          )}

          <ul className="ml-auto hidden gap-8 md:flex">
            {SECCIONES.map((s) => (
              <li key={s.href}>
                <Link
                  href={ruta(lang, s.href)}
                  className="etiqueta flex items-center gap-1.5 whitespace-nowrap text-tinta-media transition-colors hover:text-tinta"
                >
                  {s.carrito && <IconoCarrito />}
                  {nav[s.clave]}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-3 md:ml-8 md:gap-4">
            <BotonIdioma lang={lang} etiqueta={nav.cambiarIdioma} />

            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-label={abierto ? nav.cerrarMenu : nav.abrirMenu}
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
          className="flex h-full flex-col justify-between px-5 pb-12 pt-[calc(var(--alto-barra)+2rem)]"
        >
          <ul className="flex flex-col gap-2">
            {SECCIONES.map((s, i) => (
              <li key={s.href}>
                <Link
                  href={ruta(lang, s.href)}
                  tabIndex={abierto ? undefined : -1}
                  className="titular flex items-center gap-2.5 py-1.5 hover:opacity-55"
                  style={{
                    animation: abierto
                      ? `entrar .5s cubic-bezier(.16,1,.3,1) ${i * 45}ms both`
                      : undefined,
                  }}
                >
                  {s.carrito && <IconoCarrito />}
                  {nav[s.clave]}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={ruta(lang, "/contacto")}
            tabIndex={abierto ? undefined : -1}
            className="etiqueta text-tinta-media"
          >
            {nav.contacto}
          </Link>
        </nav>
      </div>
    </>
  );
}
