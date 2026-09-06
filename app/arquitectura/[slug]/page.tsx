import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { proyecto, proyectos } from "@/lib/proyectos";
import { srcSet, url } from "@/lib/media";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await proyectos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await proyecto((await params).slug);
  return p ? { title: p.titulo, description: p.descripcion?.slice(0, 160) } : {};
}

export default async function PaginaProyecto({
  params,
}: { params: Promise<{ slug: string }> }) {
  const p = await proyecto((await params).slug);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 md:px-10 md:pt-20">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="display">{p.titulo}</h1>
        </div>
        <dl className="grid h-fit grid-cols-2 gap-x-6 gap-y-4 self-end md:col-span-4 md:col-start-9">
          {p.ubicacion && <Dato t="Ubicación" v={p.ubicacion} />}
          {p.anio && <Dato t="Año" v={String(p.anio)} />}
          {p.estado && <Dato t="Estado" v={p.estado} />}
          <Dato t="Láminas" v={String(p.laminas.length)} />
        </dl>
      </header>

      {p.descripcion && (
        <p className="mt-12 max-w-prose leading-relaxed text-tinta-media">
          {p.descripcion}
        </p>
      )}

      <div className="mt-16 space-y-16 pb-8">
        {p.laminas.map((l, i) => (
          <figure key={l.id} className="revelar">
            <div
              className="relative overflow-hidden bg-papel-alt"
              style={{ aspectRatio: `${l.imagen_w} / ${l.imagen_h}` }}
            >
              {l.blur && (
                <img src={l.blur} alt="" aria-hidden
                     className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl" />
              )}
              <img
                src={url(l.imagen, "lg")}
                srcSet={srcSet(l.imagen)}
                sizes="(min-width: 1024px) 90vw, 100vw"
                alt={`${p.titulo}, lámina ${i + 1}`}
                width={l.imagen_w}
                height={l.imagen_h}
                loading={i < 2 ? "eager" : "lazy"}
                className="relative w-full"
              />
            </div>
            {l.epigrafe && (
              <figcaption className="mt-4 max-w-prose text-[0.875rem] leading-relaxed text-tinta-media">
                {l.epigrafe}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </main>
  );
}

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div>
      <dt className="etiqueta text-tinta-suave">{t}</dt>
      <dd className="mt-1 text-[0.9375rem]">{v}</dd>
    </div>
  );
}
