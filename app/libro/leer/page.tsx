import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { capitulos } from "@/lib/libro";

export const metadata: Metadata = {
  title: "El Aprendiz — leer",
  robots: { index: false },
};

/**
 * El texto se renderiza en el server y solo despues de la cookie. La novela
 * nunca sale por la API publica.
 */
export default async function Leer() {
  if ((await cookies()).get("libro")?.value !== "1") redirect("/libro");

  const caps = await capitulos();

  return (
    <div className="bg-papel-alt">
      <nav className="sticky top-[57px] z-40 border-b border-linea bg-papel-alt/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl overflow-x-auto px-5 py-3">
          <ul className="flex gap-4">
            {caps.map((c) => (
              <li key={c.orden}>
                <a
                  href={`#cap-${c.orden}`}
                  className="etiqueta whitespace-nowrap text-tinta-suave hover:text-tinta"
                >
                  {c.numero ?? "Pról."}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="mx-auto max-w-[38rem] px-5 py-16">
        <header className="mb-20 text-center">
          <h1 className="titular">El Aprendiz</h1>
          <p className="mt-3 text-tinta-media">Ciudad Intradorada</p>
          <p className="etiqueta mt-6 text-tinta-suave">Santiago Azcuy</p>
        </header>

        {caps.map((c) => (
          <section key={c.orden} id={`cap-${c.orden}`} className="mb-24 scroll-mt-32">
            <h2 className="mb-10 text-center">
              {c.numero !== null && (
                <span className="etiqueta block text-tinta-suave">{c.numero}</span>
              )}
              <span className="mt-2 block text-[1.75rem] tracking-tight">{c.titulo}</span>
            </h2>
            <div
              className="prosa"
              dangerouslySetInnerHTML={{ __html: c.contenido }}
            />
          </section>
        ))}

        <footer className="border-t border-linea pt-10 text-center">
          <p className="text-tinta-media">Fin.</p>
          <Link href="/obras" className="etiqueta mt-6 inline-block underline-offset-8 hover:underline">
            Ver la obra plástica →
          </Link>
        </footer>
      </main>
    </div>
  );
}
