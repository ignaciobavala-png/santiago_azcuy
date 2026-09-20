import { Suspense } from "react";
import type { Metadata } from "next";
import { Filtros } from "@/components/Filtros";
import { ObraCard } from "@/components/ObraCard";
import { obras, conteos } from "@/lib/consultas";
import { fmt, type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";
import { CATEGORIAS, type Categoria } from "@/lib/tipos";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: (await dic((await params).lang)).obras.titulo };
}

const VALIDAS = new Set<string>(CATEGORIAS);

export default async function Galeria({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ categoria?: string; encargo?: string }>;
}) {
  const [{ lang }, p] = await Promise.all([params, searchParams]);
  const d = await dic(lang);
  const categoria = p.categoria && VALIDAS.has(p.categoria) ? (p.categoria as Categoria) : undefined;
  const encargo = p.encargo === "1";

  const [lista, c] = await Promise.all([obras({ categoria, encargo }), conteos()]);

  return (
    <main className="mx-auto max-w-[1600px] px-5 md:px-10">
      <header className="flex flex-col gap-8 pt-14 pb-10 md:pt-20">
        <h1 className="display">{d.obras.titulo}</h1>
        <Suspense fallback={<div className="h-9" />}>
          <Filtros conteos={c} d={d.obras} />
        </Suspense>
      </header>

      {lista.length === 0 ? (
        <p className="py-24 text-tinta-media">{d.obras.vacio}</p>
      ) : (
        <section className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((o, i) => (
            <ObraCard
              key={o.id}
              obra={o}
              lang={lang}
              prioridad={i < 4}
              sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            />
          ))}
        </section>
      )}

      <p className="etiqueta mt-16 text-tinta-suave">{fmt(lista.length === 1 ? d.obras.cuentaUna : d.obras.cuentaVarias, { n: lista.length })}</p>
    </main>
  );
}
