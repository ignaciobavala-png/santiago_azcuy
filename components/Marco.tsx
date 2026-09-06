import Link from "next/link";
import { Burger, BotonIdioma, BotonTema } from "@/components/Herramientas";
import { ruta, t, type Diccionario, type Lang } from "@/lib/i18n";

export const SECCIONES: { href: string; clave: keyof Diccionario["nav"] }[] = [
  { href: "/obras", clave: "obras" },
  { href: "/musica", clave: "musica" },
  { href: "/libro", clave: "libro" },
  { href: "/arquitectura", clave: "arquitectura" },
  { href: "/sobre", clave: "sobre" },
];

export function Cabecera({ lang }: { lang: Lang }) {
  const d = t(lang);

  return (
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
          <Burger lang={lang} secciones={SECCIONES} />
        </div>
      </nav>
    </header>
  );
}

export function Pie({ lang }: { lang: Lang }) {
  const d = t(lang);

  return (
    <footer className="mt-32 border-t border-linea">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <p className="titular max-w-xl whitespace-pre-line">{d.cierre.obra}</p>
        <div className="flex items-end gap-8">
          {/* El PNG original es blanco sobre transparente y desaparecia sobre
              el papel claro. Va como mascara CSS: toma currentColor, asi que
              se lee igual en tema claro, en oscuro y sobre el negro de la obra. */}
          <span
            className="firma h-16 w-16 text-tinta md:h-20 md:w-20"
            role="img"
            aria-label={d.cierre.firma}
          />
          <p className="etiqueta pb-1 text-tinta-suave">
            © {new Date().getFullYear()} Santiago Azcuy
          </p>
        </div>
      </div>
    </footer>
  );
}
