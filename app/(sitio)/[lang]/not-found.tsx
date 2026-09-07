import Link from "next/link";
import { dic } from "@/lib/textos";

/**
 * El 404 no puede leer params: Next lo renderiza fuera del segmento [lang].
 * Va bilingue en la misma pagina, que para dos frases es mas honesto que
 * adivinar el idioma desde el header del navegador; por eso pide los dos
 * diccionarios en vez de uno.
 */
export default async function NoEncontrado() {
  const [es, en] = await Promise.all([dic("es"), dic("en")]);

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-32 md:px-10 md:pt-20">
      <h1 className="display">{es.err.titulo}</h1>
      <p className="mt-10 text-tinta-media">
        {es.err.texto} <span className="text-tinta-suave">{en.err.texto}</span>
      </p>
      <Link href="/" className="etiqueta mt-6 inline-block underline-offset-8 hover:underline">
        {es.err.volver} · {en.err.volver} →
      </Link>
    </main>
  );
}
