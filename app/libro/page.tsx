import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PuertaLibro } from "@/components/PuertaLibro";
import { srcSet, url } from "@/lib/media";
import { indice } from "@/lib/libro";
import { texto } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "El Aprendiz",
  description: "Ciudad Intradorada — la novela de Santiago Azcuy.",
};

export default async function Libro() {
  const [caps, sinopsis, ck] = await Promise.all([indice(), texto("libro.sinopsis"), cookies()]);
  const yaEntro = ck.get("libro")?.value === "1";
  const palabras = caps.reduce((a, c) => a + c.palabras, 0);

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 md:px-10 md:pt-20">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <figure className="md:col-span-5 lg:col-span-4">
          <img
            src={url("libro/portada", "md")}
            srcSet={srcSet("libro/portada")}
            sizes="(min-width: 768px) 38vw, 92vw"
            alt="Portada de El Aprendiz, Ciudad Intradorada"
            width={1131}
            height={1600}
            className="w-full"
          />
        </figure>

        <div className="md:col-span-7 lg:col-span-6 lg:col-start-6">
          <p className="etiqueta text-tinta-suave">Novela · Editorial Dunken, 2023</p>
          <h1 className="titular mt-4">
            El Aprendiz
            <br />
            <span className="text-tinta-media">Ciudad Intradorada</span>
          </h1>

          <p className="mt-8 max-w-prose leading-relaxed text-tinta-media">
            {sinopsis ||
              "Una historia fantástica con una enseñanza oculta entre líneas. Algo de magia, algo de ficción y algo de realidad."}
          </p>

          <p className="etiqueta mt-8 text-tinta-suave">
            {caps.length} capítulos · {palabras.toLocaleString("es")} palabras
          </p>

          <div className="mt-10">
            {yaEntro ? (
              <Link
                href="/libro/leer"
                className="etiqueta inline-block border border-tinta px-6 py-3 transition-colors hover:bg-tinta hover:text-papel"
              >
                Seguir leyendo →
              </Link>
            ) : (
              <PuertaLibro />
            )}
          </div>
        </div>
      </div>

      <section className="mt-24 border-t border-linea pt-10">
        <h2 className="etiqueta text-tinta-suave">Índice</h2>
        <ol className="mt-6 grid gap-x-12 gap-y-1 md:grid-cols-2">
          {caps.map((c) => (
            <li key={c.orden} className="flex items-baseline gap-3 border-b border-linea/70 py-2.5">
              <span className="etiqueta w-6 shrink-0 text-tinta-suave">
                {c.numero ?? "—"}
              </span>
              <span className="text-[0.9375rem]">{c.titulo}</span>
              <span className="etiqueta ml-auto shrink-0 text-tinta-suave">
                {c.palabras.toLocaleString("es")}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
