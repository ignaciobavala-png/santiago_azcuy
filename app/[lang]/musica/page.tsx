import type { Metadata } from "next";
import { YouTube } from "@/components/YouTube";
import { musica, CANAL_YOUTUBE, SPOTIFY_ARTISTA, type Pista } from "@/lib/musica";
import { t, type Lang } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: t((await params).lang).musica.titulo };
}

/**
 * Cuatro bloques con peso distinto, no una grilla plana de 29 videos: los
 * albumes van grandes porque son la obra, los clips en grilla, y los temas
 * sueltos en lista compacta. Con este volumen de material, tratar todo igual es
 * lo mismo que no ordenarlo.
 */
export default async function Musica({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang).musica;
  const m = await musica();

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 md:px-10 md:pt-20">
      <header className="grid gap-8 md:grid-cols-12">
        <h1 className="display md:col-span-7">{d.titulo}</h1>
        <p className="max-w-sm self-end text-[1.0625rem] leading-relaxed text-tinta-media md:col-span-4 md:col-start-9">
          {d.intro}
        </p>
      </header>

      {/* Spotify primero: es donde los temas estan como discos, con la ficha
          completa. El iframe es de Spotify, asi que no cuesta storage ni egress. */}
      <section className="mt-16">
        <h2 className="etiqueta text-tinta-suave">{d.escuchar}</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-12">
          <iframe
            src={`https://open.spotify.com/embed/artist/${SPOTIFY_ARTISTA}?theme=0`}
            title="Santiago Azcuy — Spotify"
            loading="lazy"
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="h-[420px] w-full rounded-xl border-0 md:col-span-8"
          />
          <p className="self-end md:col-span-3 md:col-start-10">
            <a
              href={`https://open.spotify.com/artist/${SPOTIFY_ARTISTA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="etiqueta underline-offset-8 hover:underline"
            >
              {d.verSpotify}
            </a>
          </p>
        </div>
      </section>

      <Bloque titulo={d.albumes} nota={d.albumesNota}>
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
          {m.album.map((p, i) => (
            <Ficha key={p.id} p={p} d={d} prioridad={i < 2} />
          ))}
        </div>
      </Bloque>

      <Bloque titulo={d.clips}>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {m.clip.map((p) => (
            <Ficha key={p.id} p={p} d={d} />
          ))}
        </div>
      </Bloque>

      <Bloque titulo={d.temas}>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {[...m.tema, ...m.entrevista].map((p) => (
            <Ficha key={p.id} p={p} d={d} />
          ))}
        </div>
      </Bloque>

      <p className="mt-20 border-t border-linea pt-8">
        <a
          href={CANAL_YOUTUBE}
          target="_blank"
          rel="noopener noreferrer"
          className="etiqueta underline-offset-8 hover:underline"
        >
          {d.verCanal}
        </a>
      </p>
    </main>
  );
}

function Bloque({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-24 border-t border-linea pt-8">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="titular">{titulo}</h2>
        {nota && <p className="text-[0.875rem] text-tinta-media">{nota}</p>}
      </div>
      {children}
    </section>
  );
}

function Ficha({
  p,
  d,
  prioridad = false,
}: {
  p: Pista;
  d: ReturnType<typeof t>["musica"];
  prioridad?: boolean;
}) {
  return (
    <article className="revelar">
      <YouTube
        id={p.recurso}
        titulo={p.titulo}
        miniatura={p.miniatura}
        etiqueta={d.reproducir(p.titulo)}
        cargando={d.cargando}
        prioridad={prioridad}
      />
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="text-[0.9375rem] leading-snug tracking-tight">{p.titulo}</h3>
        <span className="etiqueta shrink-0 text-tinta-suave">{p.duracion}</span>
      </div>
    </article>
  );
}
