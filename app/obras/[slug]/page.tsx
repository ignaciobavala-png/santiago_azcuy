import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obra, obras } from "@/lib/consultas";
import { srcSet, url } from "@/lib/media";
import { ETIQUETA, ficha } from "@/lib/tipos";
import { ObraCard } from "@/components/ObraCard";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await obras()).map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const o = await obra((await params).slug);
  if (!o) return {};
  return {
    title: o.titulo,
    description: ficha(o) || undefined,
    openGraph: { images: [{ url: url(o.imagen, "lg") }] },
  };
}

/**
 * Aca el sitio pasa a fondo oscuro. La cascara editorial clara sirve para
 * indices; frente a una obra sola, el negro la deja respirar y le va al
 * costado cosmico del trabajo, sin agregar decoracion.
 */
export default async function PaginaObra({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const o = await obra((await params).slug);
  if (!o) notFound();

  const relacionadas = (await obras({ categoria: o.categoria, limite: 5 }))
    .filter((r) => r.id !== o.id)
    .slice(0, 4);

  return (
    <>
      <article className="-mt-px bg-noche text-papel">
        <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-20">
          <figure
            className="relative mx-auto max-h-[82vh] w-fit overflow-hidden"
            style={{ aspectRatio: `${o.imagen_w} / ${o.imagen_h}` }}
          >
            <img
              src={url(o.imagen, "lg")}
              srcSet={srcSet(o.imagen)}
              sizes="(min-width: 1024px) 78vw, 100vw"
              alt={o.titulo}
              width={o.imagen_w}
              height={o.imagen_h}
              fetchPriority="high"
              className="max-h-[82vh] w-auto object-contain"
            />
          </figure>

          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1 className="titular text-balance">{o.titulo}</h1>
              {o.descripcion && (
                <p className="mt-6 max-w-prose leading-relaxed text-papel/70">
                  {o.descripcion}
                </p>
              )}
            </div>

            <dl className="grid h-fit grid-cols-2 gap-x-6 gap-y-5 md:col-span-5">
              <Dato termino="Categoría" valor={ETIQUETA[o.categoria]} />
              {o.tecnica && <Dato termino="Técnica" valor={o.tecnica} />}
              {o.ancho_cm && o.alto_cm && (
                <Dato termino="Medidas" valor={`${o.ancho_cm} × ${o.alto_cm} cm`} />
              )}
              {o.anio && <Dato termino="Año" valor={String(o.anio)} />}
              {o.es_encargo && <Dato termino="Origen" valor="Por encargo" />}
              <Dato termino="Estado" valor={o.disponible ? "Disponible" : "No disponible"} />
            </dl>
          </div>

          <Link
            href="/contacto"
            className="etiqueta mt-12 inline-block border border-papel/25 px-6 py-3 transition-colors hover:bg-papel hover:text-noche"
          >
            Consultar por esta obra
          </Link>
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
          <h2 className="etiqueta mb-8 text-tinta-suave">
            Más {ETIQUETA[o.categoria].toLowerCase()}
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {relacionadas.map((r) => (
              <ObraCard key={r.id} obra={r} sizes="(min-width: 1024px) 23vw, 45vw" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Dato({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="etiqueta text-papel/45">{termino}</dt>
      <dd className="mt-1.5 text-[0.9375rem]">{valor}</dd>
    </div>
  );
}
