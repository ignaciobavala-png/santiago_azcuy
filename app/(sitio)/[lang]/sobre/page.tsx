import type { Metadata } from "next";
import Link from "next/link";
import { EnConstruccion } from "@/components/EnConstruccion";
import { ruta, type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";
import { texto } from "@/lib/consultas";
import { sobreGaleria } from "@/lib/sobre";
import { srcSet, url } from "@/lib/media";
import { embedUrl } from "@/lib/embed";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: (await dic((await params).lang)).sobre.titulo };
}

export default async function Pagina({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = await dic(lang);
  const [bio, media] = await Promise.all([texto("biografia", lang), sobreGaleria()]);

  // Sin biografia cargada y sin material: el placeholder de siempre.
  if (!bio && media.length === 0) {
    return <EnConstruccion titulo={d.sobre.titulo} nota={d.sobre.nota} mientras={d.err.mientras} lang={lang} />;
  }

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-32 md:px-10 md:pt-20">
      <h1 className="display">{d.sobre.titulo}</h1>

      {bio && (
        <p className="mt-10 max-w-prose whitespace-pre-line leading-relaxed text-tinta-media">
          {bio}
        </p>
      )}

      {media.length === 0 && (
        <Link
          href={ruta(lang, "/galeria")}
          className="etiqueta mt-8 inline-block underline-offset-8 hover:underline"
        >
          {d.err.mientras}
        </Link>
      )}

      {media.length > 0 && (
        <div className="mt-16 space-y-16 pb-8">
          {media.map((m, i) =>
            m.tipo === "foto" ? (
              <figure key={m.id} className="revelar">
                <div
                  className="relative overflow-hidden bg-papel-alt"
                  style={{ aspectRatio: `${m.imagen_w} / ${m.imagen_h}` }}
                >
                  {m.blur && (
                    <img
                      src={m.blur}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl"
                    />
                  )}
                  <img
                    src={url(m.imagen!, "lg")}
                    srcSet={srcSet(m.imagen!)}
                    sizes="(min-width: 1024px) 90vw, 100vw"
                    alt={m.epigrafe ?? d.sobre.titulo}
                    width={m.imagen_w!}
                    height={m.imagen_h!}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="relative w-full"
                  />
                </div>
                {m.epigrafe && (
                  <figcaption className="mt-4 max-w-prose text-[0.875rem] leading-relaxed text-tinta-media">
                    {m.epigrafe}
                  </figcaption>
                )}
              </figure>
            ) : (
              <figure key={m.id} className="revelar">
                <div className="relative aspect-video overflow-hidden bg-papel-alt">
                  <iframe
                    src={embedUrl(m.video_url ?? "") ?? undefined}
                    title={m.epigrafe ?? d.sobre.titulo}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                {m.epigrafe && (
                  <figcaption className="mt-4 max-w-prose text-[0.875rem] leading-relaxed text-tinta-media">
                    {m.epigrafe}
                  </figcaption>
                )}
              </figure>
            )
          )}
        </div>
      )}
    </main>
  );
}
