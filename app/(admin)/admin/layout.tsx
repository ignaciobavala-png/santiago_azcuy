import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { cerrarSesion } from "@/lib/admin/acciones-sesion";
import { tieneSesion } from "@/lib/admin/sesion";
import "../../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Panel · Santiago Azcuy", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

/** El panel comparte la preferencia de tema del sitio publico. */
const TEMA = `try{var t=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

const SECCIONES = [
  { href: "/admin", etiqueta: "Tablero" },
  { href: "/admin/obras", etiqueta: "Obras" },
  { href: "/admin/series", etiqueta: "Series" },
  { href: "/admin/textos", etiqueta: "Textos" },
  { href: "/admin/musica", etiqueta: "Música" },
  { href: "/admin/arquitectura", etiqueta: "Arquitectura" },
  { href: "/admin/consultas", etiqueta: "Consultas" },
  { href: "/admin/libro", etiqueta: "Libro" },
];

/**
 * Segundo layout raiz del proyecto. Vive en su propio grupo de rutas y no
 * existe app/layout.tsx, asi que cada grupo tiene el suyo. El panel no cuelga
 * de [lang]: es una herramienta en castellano, sin cabecera publica ni pie.
 */
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const sesion = await tieneSesion();

  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA }} />
      </head>
      <body className="min-h-screen antialiased">
        {sesion && (
          <header className="border-b border-linea bg-papel">
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8">
              <Link href="/admin" className="etiqueta shrink-0">
                Santiago Azcuy — Panel
              </Link>
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
                {SECCIONES.map((s) => (
                  <Link key={s.href} href={s.href} className="etiqueta text-tinta-media hover:text-tinta">
                    {s.etiqueta}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-5">
                <a
                  href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etiqueta text-tinta-media hover:text-tinta"
                >
                  Ver sitio ↗
                </a>
                <form action={cerrarSesion}>
                  <button type="submit" className="etiqueta text-tinta-media underline-offset-4 hover:text-tinta hover:underline">
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
