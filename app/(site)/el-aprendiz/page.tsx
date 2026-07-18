import Image from "next/image"
import DescargaNovela from "./DescargaNovela"
import JsonLd from "@/components/seo/JsonLd"
import { bookSchema } from "@/lib/seo"

export const metadata = {
  title: "El Aprendiz · Ciudad Intradorada",
  description:
    "El Aprendiz · Ciudad Intradorada, una novela de Santiago Azcuy. Descargá el PDF gratis y escuchá el audiolibro.",
  alternates: { canonical: "/el-aprendiz" },
}

const SPOTIFY_SHOW = "0JkEQKy6kGJk1ykfn9Jg8U"

export default function ElAprendizPage() {
  return (
    <>
      <JsonLd data={bookSchema()} />
      {/* ── HERO: portada + descarga ─────────────────────────── */}
      <section id="novela" data-subsection className="section-cool pt-16 pb-20 px-5 md:px-8 scroll-mt-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Portada */}
            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm aspect-[2480/3508] shadow-2xl">
                <Image
                  src="/el-aprendiz/portada.webp"
                  alt="Portada de El Aprendiz — Ciudad Intradorada"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 384px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Texto + form */}
            <div className="flex flex-col gap-6">
              <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)]">
                Novela · Santiago Azcuy
              </p>
              <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl sm:text-5xl md:text-6xl leading-none text-[var(--color-text)]">
                El Aprendiz
                <span className="block text-2xl md:text-3xl italic text-[var(--color-muted)] mt-3">
                  Ciudad Intradorada
                </span>
              </h1>
              <div className="w-10 h-px bg-[var(--color-border)]" />
              <p className="font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[var(--color-text)]/80">
                Una travesía iniciática entre la materia y el espíritu. Descargá la
                novela completa en PDF de forma gratuita.
              </p>
              <div className="pt-2">
                <DescargaNovela />
              </div>
            </div>
          </div>
        </section>

        {/* ── AUDIOLIBRO ───────────────────────────────────────── */}
        <section id="audiolibro" data-subsection className="section-warm px-5 md:px-8 py-20 md:py-28 border-t border-[var(--color-border)] scroll-mt-32">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
            <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)]">
              Audiolibro
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)]">
              Escuchá El Aprendiz
            </h2>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xl">
              La novela narrada, capítulo a capítulo. Reproducila acá o seguila
              directamente desde Spotify.
            </p>
            <div className="w-full">
              <iframe
                title="El Aprendiz — Audiolibro en Spotify"
                src={`https://open.spotify.com/embed/show/${SPOTIFY_SHOW}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          </div>
        </section>
    </>
  )
}
