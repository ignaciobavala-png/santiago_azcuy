import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getExposiciones } from "@/lib/supabase/queries"

export const metadata = {
  title: "Sobre el artista — Santiago Azcuy",
  description: "Artista plástico argentino. Óleo, acrílico y técnica mixta.",
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return ""
  return new Date(fecha).getFullYear().toString()
}

export default async function SobrePage() {
  const exposiciones = await getExposiciones()

  const individuales = exposiciones.filter((e) => e.tipo === "individual")
  const colectivas = exposiciones.filter((e) => e.tipo === "colectiva")

  return (
    <>
      <Header />
      <main className="flex-1 pt-32 pb-24">

        {/* Bio */}
        <section className="px-8 max-w-3xl mx-auto mb-24">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-4">
            Artista plástico
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl text-[var(--color-text)] mb-10">
            Santiago Azcuy
          </h1>

          <div className="space-y-6 font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[var(--color-text)]/80">
            <p>
              Santiago Azcuy es un artista plástico argentino radicado en Buenos Aires.
              Su obra explora el espacio interior y la memoria a través del óleo, el acrílico
              y la técnica mixta sobre tela y papel.
            </p>
            <p>
              Cada obra es un diálogo entre la materia y el tiempo: capas de pigmento que
              acumulan gestos, borraduras y reescrituras, suspendiendo al espectador en una
              tensión sin resolución definitiva.
            </p>
            <p>
              Ha expuesto en galerías y espacios culturales de Argentina y el exterior,
              participando en muestras individuales y colectivas desde 2015.
            </p>
          </div>
        </section>

        {/* Exposiciones */}
        {exposiciones.length > 0 && (
          <section className="px-8 max-w-3xl mx-auto border-t border-[var(--color-border)] pt-16">
            <h2 className="font-[family-name:var(--font-cormorant)] font-light text-3xl text-[var(--color-text)] mb-12">
              Exposiciones
            </h2>

            {individuales.length > 0 && (
              <div className="mb-12">
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-6">
                  Individuales
                </p>
                <ul className="space-y-5">
                  {individuales.map((exp) => (
                    <li key={exp.id} className="flex items-baseline gap-6">
                      <span className="shrink-0 text-sm text-[var(--color-muted)] w-10">
                        {formatFecha(exp.fecha_inicio)}
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-text)]">
                          {exp.titulo}
                        </p>
                        {(exp.lugar || exp.ciudad) && (
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {[exp.lugar, exp.ciudad, exp.pais].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {colectivas.length > 0 && (
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-6">
                  Colectivas
                </p>
                <ul className="space-y-5">
                  {colectivas.map((exp) => (
                    <li key={exp.id} className="flex items-baseline gap-6">
                      <span className="shrink-0 text-sm text-[var(--color-muted)] w-10">
                        {formatFecha(exp.fecha_inicio)}
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-text)]">
                          {exp.titulo}
                        </p>
                        {(exp.lugar || exp.ciudad) && (
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {[exp.lugar, exp.ciudad, exp.pais].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}
