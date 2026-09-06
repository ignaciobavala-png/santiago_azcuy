import type { Metadata } from "next";
import Link from "next/link";
import { proyectos } from "@/lib/proyectos";
import { srcSet, url } from "@/lib/media";
import { ruta, t, type Lang } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: t((await params).lang).arq.titulo };
}

export default async function Arquitectura({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const lista = await proyectos();

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 md:px-10 md:pt-20">
      <h1 className="display">{t(lang).arq.titulo}</h1>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        {lista.map((p) => (
          <Link
            key={p.id}
            href={ruta(lang, `/arquitectura/${p.slug}`)}
            className="group block"
          >
            <figure className="overflow-hidden bg-papel-alt">
              <img
                src={url(`proyectos/${p.slug}/01`, "md")}
                srcSet={srcSet(`proyectos/${p.slug}/01`)}
                sizes="(min-width: 768px) 46vw, 92vw"
                alt={p.titulo}
                className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
              />
            </figure>
            <h2 className="titular mt-5">{p.titulo}</h2>
            <p className="etiqueta mt-2 text-tinta-suave">
              {[p.ubicacion, p.anio].filter(Boolean).join(" · ")}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
