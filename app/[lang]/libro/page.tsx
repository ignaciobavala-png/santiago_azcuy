import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PuertaLibro } from "@/components/PuertaLibro";
import { YouTube } from "@/components/YouTube";
import { srcSet, url } from "@/lib/media";
import { indice } from "@/lib/libro";
import { texto } from "@/lib/consultas";
import { AUDIOLIBRO } from "@/lib/musica";
import { miles, ruta, t, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const d = t((await params).lang);
  return { title: d.nav.libro, description: `${d.libro.subtitulo} — Santiago Azcuy.` };
}

export default async function Libro({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang);
  const [caps, sinopsis, ck] = await Promise.all([
    indice(),
    texto("libro.sinopsis", lang),
    cookies(),
  ]);
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
            alt={`${d.nav.libro}, ${d.libro.subtitulo}`}
            width={1131}
            height={1600}
            className="w-full"
          />
        </figure>

        <div className="md:col-span-7 lg:col-span-6 lg:col-start-6">
          <p className="etiqueta text-tinta-suave">{d.libro.etiqueta}</p>
          <h1 className="titular mt-4">
            {d.nav.libro}
            <br />
            <span className="text-tinta-media">{d.libro.subtitulo}</span>
          </h1>

          <p className="mt-8 max-w-prose leading-relaxed text-tinta-media">
            {sinopsis || d.libro.sinopsis}
          </p>

          <p className="etiqueta mt-8 text-tinta-suave">
            {d.libro.ficha(caps.length, miles(palabras, lang))}
          </p>

          <div className="mt-10">
            {yaEntro ? (
              <Link
                href={ruta(lang, "/libro/leer")}
                className="etiqueta inline-block border border-tinta px-6 py-3 transition-colors hover:bg-tinta hover:text-papel"
              >
                {d.libro.seguir}
              </Link>
            ) : (
              <PuertaLibro lang={lang} />
            )}
          </div>
        </div>
      </div>

      {/*
        El audiolibro va sin puerta de mail a proposito: ya esta publico en
        YouTube, asi que pedir el mail para algo que se consigue buscando el
        titulo seria un peaje falso. Lo que filtra es el texto, que no esta.
      */}
      <section className="mt-24 grid gap-10 border-t border-linea pt-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="etiqueta text-tinta-suave">{d.libro.audioEtiqueta}</p>
          <h2 className="titular mt-3">{d.libro.audioTitulo}</h2>
          <p className="mt-4 max-w-sm text-tinta-media">{d.libro.audioTexto}</p>
          <p className="etiqueta mt-5 text-tinta-suave">{AUDIOLIBRO.duracion}</p>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <YouTube
            id={AUDIOLIBRO.id}
            titulo={`${d.nav.libro} — ${d.libro.audioEtiqueta}`}
            miniatura="maxresdefault"
            etiqueta={d.musica.reproducir(d.libro.audioEtiqueta)}
            cargando={d.musica.cargando}
          />
        </div>
      </section>

      <section className="mt-24 border-t border-linea pt-10">
        <h2 className="etiqueta text-tinta-suave">{d.libro.indice}</h2>
        <ol className="mt-6 grid gap-x-12 gap-y-1 md:grid-cols-2">
          {caps.map((c) => (
            <li key={c.orden} className="flex items-baseline gap-3 border-b border-linea/70 py-2.5">
              <span className="etiqueta w-6 shrink-0 text-tinta-suave">{c.numero ?? "—"}</span>
              <span className="text-[0.9375rem]">{c.titulo}</span>
              <span className="etiqueta ml-auto shrink-0 text-tinta-suave">
                {miles(c.palabras, lang)}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
