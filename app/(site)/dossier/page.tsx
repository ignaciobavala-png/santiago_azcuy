export const metadata = {
  title: "Dossier — Espiral Virtuosa · Santiago Azcuy",
  description: "Dossier de proceso de Espiral Virtuosa. Un tratado visual sobre la espiral virtuosa, un bucle cósmico que reinterpreta nuestra relación con la materia, la economía y el propósito.",
}

const CAPITULOS = [
  { numero: "03", titulo: "Del concepto al boceto", subtitulo: "Primeros trazos y definición del concepto circular" },
  { numero: "04", titulo: "Construcción compositiva", subtitulo: "Mancha base y primeras capas de color" },
  { numero: "05", titulo: "Desarrollo pictórico", subtitulo: "Avance de detalles y elementos simbólicos" },
  { numero: "06", titulo: "Lenguaje simbólico", subtitulo: "Momentos del Workinprogress" },
  { numero: "07", titulo: "El artista en proceso", subtitulo: "Vista en el taller durante la ejecución de la obra" },
  { numero: "08", titulo: "El artista en proceso", subtitulo: "Vista en el taller durante la ejecución de la obra" },
  { numero: "09", titulo: "Obra terminada", subtitulo: "Espiral Virtuosa · 150 × 130 cm · Acrílico y Óleo sobre lienzo" },
  { numero: "10", titulo: "Detalles finales", subtitulo: "El flujo y las estaciones del año" },
  { numero: "11", titulo: "Detalles finales", subtitulo: "El espiral, la noche y las estrellas" },
]

export default function DossierPage() {
  return (
    <>
      {/* ── PORTADA ─────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 border-b border-[var(--color-border)]">
          <div className="flex flex-col items-center gap-6 max-w-2xl">
            <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-muted)]">
              Dossier de proceso
            </p>
            <div className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="font-[family-name:var(--font-cormorant)] font-light text-6xl md:text-8xl leading-none text-[var(--color-text)]">
              Espiral<br />Virtuosa
            </h1>
            <div className="w-8 h-px bg-[var(--color-border)]" />
            <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[var(--color-muted)]">
              Santiago Azcuy
            </p>
            <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-muted)] mt-2">
              Azemy
            </p>
          </div>
          {/* Número de página */}
          <span className="absolute bottom-10 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">
            01
          </span>
        </section>

        {/* ── TEXTO CONCEPTUAL ────────────────────────────────── */}
        <section className="section-cool relative px-8 py-24 md:py-32 border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto">

            <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)] mb-12">
              02 · Espiral Virtuosa
            </p>

            <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)] mb-12 leading-tight">
              Dossier de proceso
            </h2>

            <div className="flex flex-col gap-8 font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[var(--color-text)]/80">
              <p>
                La Espiral Virtuosa representa el recorrido mediante el cual la materia, la energía y la voluntad convergen para dar origen a una transformación constante.
              </p>
              <p>
                No describe un ciclo cerrado, sino un movimiento ascendente donde cada decisión genera nuevas posibilidades.
              </p>
              <p>
                Esta pieza es un tratado visual sobre la espiral virtuosa, un bucle cósmico que reinterpreta nuestra relación con la materia, la economía y el propósito.
              </p>
              <p>
                Aquí, la abundancia no es acumulación lineal, sino transformación continua.
              </p>
              <div className="w-8 h-px bg-[var(--color-border)] my-4" />
              <p>
                Son las virtudes las que sostienen el movimiento de la espiral. La paciencia para respetar los tiempos del proceso. La perseverancia para continuar frente a la dificultad. La templanza para mantener el equilibrio. La humildad para aprender. La cooperación para comprender que toda abundancia nace del intercambio y la reciprocidad.
              </p>
              <p>
                La vida no avanza en línea recta; crece en espiral.
              </p>
              <p>
                Cada desafío, cada sacrificio y cada decisión nos impulsa un giro más hacia arriba, transformando la experiencia material en un propósito trascendente.
              </p>
            </div>
          </div>
          <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">
            02
          </span>
        </section>

        {/* ── CAPÍTULOS CON PLACEHOLDER DE IMAGEN ─────────────── */}
        {CAPITULOS.map((cap, i) => (
          <section
            key={cap.numero}
            className={`${i % 2 === 0 ? "section-warm" : "section-cool"} relative px-8 py-20 md:py-28 border-b border-[var(--color-border)]`}
          >
            <div className="max-w-5xl mx-auto">
              <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)] mb-6">
                {cap.numero}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)] leading-tight mb-4">
                    {cap.titulo}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {cap.subtitulo}
                  </p>
                </div>
                {/* Placeholder imagen */}
                <div className="aspect-[4/3] border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)]">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-border)]">
                    Imagen próximamente
                  </p>
                </div>
              </div>
            </div>
            <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">
              {cap.numero}
            </span>
          </section>
        ))}

        {/* ── CITA FINAL ──────────────────────────────────────── */}
        <section className="section-warm relative px-8 py-32 md:py-40">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-10">
            <div className="w-8 h-px bg-[var(--color-accent)]" />
            <blockquote className="font-[family-name:var(--font-cormorant)] font-light text-2xl md:text-3xl leading-relaxed text-[var(--color-text)] italic">
              "Las virtudes son las semillas invisibles de toda transformación.
              <br /><br />
              Paciencia, perseverancia, humildad, valentía, gratitud y generosidad son fuerzas que convierten el esfuerzo en propósito y el propósito en abundancia. Cada una alimenta a la otra, dando origen a una espiral de crecimiento continuo donde toda acción consciente deja una huella y toda semilla puede convertirse en fruto"
            </blockquote>
            <div className="w-8 h-px bg-[var(--color-border)]" />
            <p className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-muted)]">
              Santiago Gerardo Azcuy
            </p>
          </div>
          <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">
            12
          </span>
        </section>
    </>
  )
}
