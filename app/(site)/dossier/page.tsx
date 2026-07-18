import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Dossier — Espiral Virtuosa",
  description: "Dossier de proceso de Espiral Virtuosa. Un tratado visual sobre la espiral virtuosa, un bucle cósmico que reinterpreta nuestra relación con la materia, la economía y el propósito.",
  alternates: { canonical: "/dossier" },
}

type Capitulo = { numero: string; titulo: string; subtitulo: string; imagen_url?: string }

const DEFAULT_CAPITULOS: Capitulo[] = [
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

const DEFAULT_PARRAFOS = [
  "La Espiral Virtuosa representa el recorrido mediante el cual la materia, la energía y la voluntad convergen para dar origen a una transformación constante.",
  "No describe un ciclo cerrado, sino un movimiento ascendente donde cada decisión genera nuevas posibilidades.",
  "Esta pieza es un tratado visual sobre la espiral virtuosa, un bucle cósmico que reinterpreta nuestra relación con la materia, la economía y el propósito.",
  "Aquí, la abundancia no es acumulación lineal, sino transformación continua.",
  "Son las virtudes las que sostienen el movimiento de la espiral. La paciencia para respetar los tiempos del proceso. La perseverancia para continuar frente a la dificultad. La templanza para mantener el equilibrio. La humildad para aprender. La cooperación para comprender que toda abundancia nace del intercambio y la reciprocidad.",
  "La vida no avanza en línea recta; crece en espiral.",
  "Cada desafío, cada sacrificio y cada decisión nos impulsa un giro más hacia arriba, transformando la experiencia material en un propósito trascendente.",
]

export default async function DossierPage() {
  const supabase = await createClient()
  const { data: dbSecciones } = await supabase
    .from("dossier_secciones")
    .select("*")

  const seccionesMap = new Map((dbSecciones ?? []).map(s => [s.slug, s.datos]))

  const portada = seccionesMap.get("portada") as Record<string, string> | undefined
  const eyebrow = portada?.eyebrow || "Dossier de proceso"
  const tituloPrincipal = portada?.titulo || "Espiral\nVirtuosa"
  const subtitulo = portada?.subtitulo || "Santiago Azcuy"
  const marca = portada?.marca || "Azemy"

  const textoData = seccionesMap.get("texto") as { parrafos?: string[] } | undefined
  const parrafos = textoData?.parrafos?.length ? textoData.parrafos : DEFAULT_PARRAFOS

  const capitulosData = seccionesMap.get("capitulos") as { items?: Capitulo[] } | undefined
  const capitulos = capitulosData?.items?.length ? capitulosData.items : DEFAULT_CAPITULOS

  const citaData = seccionesMap.get("cita") as Record<string, string> | undefined
  const cita = citaData?.cita || "Las virtudes son las semillas invisibles de toda transformación.\n\nPaciencia, perseverancia, humildad, valentía, gratitud y generosidad son fuerzas que convierten el esfuerzo en propósito y el propósito en abundancia. Cada una alimenta a la otra, dando origen a una espiral de crecimiento continuo donde toda acción consciente deja una huella y toda semilla puede convertirse en fruto"
  const firma = citaData?.firma || "Santiago Gerardo Azcuy"

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 md:px-8 border-b border-[var(--color-border)]">
        <div className="flex flex-col items-center gap-6 max-w-2xl">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-muted)]">{eyebrow}</p>
          <div className="w-8 h-px bg-[var(--color-accent)]" />
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl sm:text-6xl md:text-8xl leading-none text-[var(--color-text)] whitespace-pre-line">
            {tituloPrincipal}
          </h1>
          <div className="w-8 h-px bg-[var(--color-border)]" />
          <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[var(--color-muted)]">{subtitulo}</p>
          <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-muted)] mt-2">{marca}</p>
        </div>
        <span className="absolute bottom-10 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">01</span>
      </section>

      <section className="section-cool relative px-5 md:px-8 py-24 md:py-32 border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)] mb-12">02 · Espiral Virtuosa</p>
          <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)] mb-12 leading-tight">Dossier de proceso</h2>
          <div className="flex flex-col gap-8 font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[var(--color-text)]/80">
            {parrafos.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">02</span>
      </section>

      {capitulos.map((cap, i) => (
        <section
          key={cap.numero + "-" + i}
          className={`${i % 2 === 0 ? "section-warm" : "section-cool"} relative px-5 md:px-8 py-20 md:py-28 border-b border-[var(--color-border)]`}
        >
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-accent)] mb-6">{cap.numero}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)] leading-tight mb-4">{cap.titulo}</h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{cap.subtitulo}</p>
              </div>
              <div className="aspect-[4/3] border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)]">
                {cap.imagen_url ? (
                  <img src={cap.imagen_url} alt={cap.titulo} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-border)]">Imagen próximamente</p>
                )}
              </div>
            </div>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">{cap.numero}</span>
        </section>
      ))}

      <section className="section-warm relative px-5 md:px-8 py-32 md:py-40">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-10">
          <div className="w-8 h-px bg-[var(--color-accent)]" />
          <blockquote className="font-[family-name:var(--font-cormorant)] font-light text-2xl md:text-3xl leading-relaxed text-[var(--color-text)] italic whitespace-pre-line">
            &ldquo;{cita}&rdquo;
          </blockquote>
          <div className="w-8 h-px bg-[var(--color-border)]" />
          <p className="font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-muted)]">{firma}</p>
        </div>
        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[var(--color-border)]">12</span>
      </section>
    </>
  )
}
