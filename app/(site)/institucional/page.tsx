import SectionTitle from "@/components/layout/SectionTitle"

export const metadata = {
  title: "Institucional",
  description:
    "Trayectoria, formación, distinciones y desarrollo artístico de Santiago Azcuy. Historial de exposiciones y participaciones en espacios institucionales, museos y ferias internacionales.",
  alternates: { canonical: "/institucional" },
}

/* ── Síntesis de trayectoria ─────────────────────────────── */
const SINTESIS = [
  { valor: "+15", detalle: "años de producción interdisciplinaria" },
  { valor: "2014–2026", detalle: "trayectoria continua de exposiciones" },
  { valor: "5", detalle: "países: Argentina, Francia, Luxemburgo, España y Uruguay" },
  { valor: "8", detalle: "álbumes de estudio y una novela publicada" },
]

/* ── Cronología de exposiciones y participaciones ────────── */
type Evento = { titulo: string; lugar: string; pais?: string }
type Anio = { anio: string; nota?: string; eventos: Evento[] }

const TRAYECTORIA: Anio[] = [
  {
    anio: "2026",
    eventos: [
      { titulo: "Pintura en vivo", lugar: "Desfile Diorling, Palacio San Miguel, CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo", lugar: "BioFeria", pais: "Argentina" },
      { titulo: "Presentación musical", lugar: "Alianza Francesa — Sede Palermo / Fortabat", pais: "Argentina" },
    ],
  },
  {
    anio: "2025",
    eventos: [
      { titulo: "Exposición colectiva «Esencia y Forma»", lugar: "Universidad de Belgrano", pais: "Argentina" },
      { titulo: "Exposición «Origen el Congreso» (III Edición)", lugar: "CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo", lugar: "Festival Amanita", pais: "Argentina" },
      { titulo: "Intervención artística y pintura en vivo", lugar: "Restaurante Diego Armando Maradona", pais: "Argentina" },
    ],
  },
  {
    anio: "2024",
    eventos: [
      { titulo: "Pintura en vivo y exposición", lugar: "Enero Costanera, CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo y exposición", lugar: "Saldías Polo Cultural, CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo", lugar: "Origen el Congreso (II Edición), CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo", lugar: "Medialuna Sessions", pais: "Argentina" },
    ],
  },
  {
    anio: "2023",
    eventos: [
      { titulo: "Exposición «Universo Azcuy»", lugar: "Fundación Sudestada 397", pais: "Argentina" },
      { titulo: "Presentación y arte en vivo", lugar: "Origen El Congreso, Auditorio Belgrano, CABA", pais: "Argentina" },
      { titulo: "Pintura en vivo y exposición «Cookunity»", lugar: "Mercado de San Telmo, CABA", pais: "Argentina" },
      { titulo: "Presentación pictórica/literaria de la novela «El Aprendiz»", lugar: "Feria Internacional del Libro de Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición y arte en vivo", lugar: "Enero Costanera, CABA", pais: "Argentina" },
    ],
  },
  {
    anio: "2022",
    eventos: [
      { titulo: "Exposición «Interplanetarios B-612»", lugar: "Salón Dorado de la Legislatura Porteña, CABA", pais: "Argentina" },
      { titulo: "Exposición colectiva «Lunática Artes Visuales»", lugar: "Paseo de las Artes", pais: "Argentina" },
    ],
  },
  {
    anio: "2021",
    eventos: [
      { titulo: "Exposición individual «Santiago Azcuy»", lugar: "Yoga Factory", pais: "Argentina" },
      { titulo: "Presentación e intervención", lugar: "Hipódromo de Palermo, CABA", pais: "Argentina" },
    ],
  },
  {
    anio: "2020",
    eventos: [
      { titulo: "Exposición «Lunática»", lugar: "Distrito Audiovisual, CABA", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Hipódromo de Buenos Aires, CABA", pais: "Argentina" },
      { titulo: "Participación artística", lugar: "Asteroid Day Argentina", pais: "Argentina" },
    ],
  },
  {
    anio: "2019",
    nota: "Trayectoria internacional",
    eventos: [
      { titulo: "Art Fair #4 Luxemburg", lugar: "Feria Internacional de Arte", pais: "Luxemburgo" },
      { titulo: "Art Shopping Paris", lugar: "Carrousel du Louvre, París", pais: "Francia" },
      { titulo: "Triennale Paris", lugar: "París", pais: "Francia" },
      { titulo: "Exposición", lugar: "MARQ — Museo de Arquitectura y Diseño, CABA", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Sofía Paez Balut, Punta del Este", pais: "Uruguay" },
      { titulo: "Exposición", lugar: "Municipio de Malvinas Argentinas, Prov. de Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición colectiva", lugar: "Cavanart, Buenos Aires", pais: "Argentina" },
      { titulo: "Participación artística", lugar: "Asteroid Day, Buenos Aires", pais: "Argentina" },
    ],
  },
  {
    anio: "2018",
    eventos: [
      { titulo: "Exposición", lugar: "Imperiale Palace Hotel, Punta del Este", pais: "Uruguay" },
      { titulo: "Muestra de arte", lugar: "Hipódromo de Buenos Aires, CABA", pais: "Argentina" },
      { titulo: "Exposición «Meeting Place»", lugar: "Estudio Doopler, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición colectiva", lugar: "VanGart, Buenos Aires", pais: "Argentina" },
    ],
  },
  {
    anio: "2017",
    eventos: [
      { titulo: "Exposición «Geometría Sagrada»", lugar: "Gallery House, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Hipódromo de Palermo, CABA", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Il Ballo del Mattone, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Ultra Hotel, Buenos Aires", pais: "Argentina" },
    ],
  },
  {
    anio: "2016",
    eventos: [
      { titulo: "Muestra individual", lugar: "Café Tortoni (lugar emblemático e histórico), CABA", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Gyula Bar Galería, Cariló, Prov. de Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Espacio INV Arte, Pinamar, Prov. de Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Ultra Hotel Palermo, CABA", pais: "Argentina" },
    ],
  },
  {
    anio: "2015",
    eventos: [
      { titulo: "«Untittle Barcelona» — exhibición colectiva", lugar: "Barcelona", pais: "España" },
      { titulo: "Exposición", lugar: "Auditorio de la Alianza Francesa, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "La Real Galería #2, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "The Club House Palermo, CABA", pais: "Argentina" },
      { titulo: "Exposición colectiva", lugar: "Conectarte Galería", pais: "Argentina" },
    ],
  },
  {
    anio: "2014",
    eventos: [
      { titulo: "Exposición", lugar: "Teatro de Arte «El Cubo», CABA", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Jet Launch, Buenos Aires", pais: "Argentina" },
      { titulo: "Exposición", lugar: "Watt Market Bar, Buenos Aires", pais: "Argentina" },
    ],
  },
]

/* ── Formación ───────────────────────────────────────────── */
const FORMACION = [
  {
    titulo: "Arquitectura",
    detalle: "Cursando el 3.º año de la carrera — Universidad de Belgrano.",
  },
  {
    titulo: "Artes visuales y diseño",
    detalle: "Trayectos formativos y técnicos en Diseño Gráfico, Arte Multimedia y Artes Visuales.",
  },
  {
    titulo: "Disciplinas corporales y filosofía",
    detalle: "Instructor de Hatha Yoga formado en El Arte de Vivir.",
  },
  {
    titulo: "Investigación teórica autónoma",
    detalle: "Historia del arte, geometría sagrada, metafísica, física cuántica y ciencias de la cosmovisión planetaria.",
  },
]

/* ── Obras clave (colección privada) ─────────────────────── */
const OBRAS_CLAVE = [
  { titulo: "Andrómeda", ficha: "Óleo y acrílico · 250×120 cm" },
  { titulo: "El Espíritu del Sur", ficha: "Díptico · Óleo y acrílico · 300×200 cm" },
  { titulo: "Cristo Metafísico", ficha: "Acrílico · 150×110 cm" },
  { titulo: "Sol", ficha: "Acrílico · 130×130 cm" },
  { titulo: "Luna", ficha: "Acrílico · 130×130 cm" },
  { titulo: "Salvador Mundi", ficha: "Acrílico · 100×70 cm · réplica y estudio de la obra homónima de Leonardo da Vinci" },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[var(--color-accent)] mb-3">
      {children}
    </p>
  )
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)]">
      {children}
    </h2>
  )
}

export default function InstitucionalPage() {
  return (
    <div className="pt-16 pb-28">
      <div className="px-5 md:px-8 max-w-3xl mx-auto">
        <SectionTitle eyebrow="Trayectoria y desarrollo" title="Institucional" />
      </div>

      <div>
        {/* ── Semblanza ─────────────────────────────────────── */}
        <section className="section-cool px-5 md:px-8 py-20 md:py-28 border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <Eyebrow>Perfil profesional</Eyebrow>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light leading-snug text-[var(--color-text)]">
              Artista visual, arquitecto en formación, pintor, dibujante, escritor y
              músico independiente. Más de quince años de producción artística
              interdisciplinaria guiada por la premisa del humanismo polifacético.
            </p>
            <p className="text-base md:text-lg text-[var(--color-muted)] leading-relaxed">
              Su obra se caracteriza por una sólida impronta simbólica y estructural que
              asimila conceptos geométricos, matemáticas áureas y colorísticas. A través de
              ella busca hacer visible lo invisible, encontrando el equilibrio y la armonía
              universal en un mensaje de consciencia y despertar espiritual. Ha exhibido su
              producción en destacados espacios institucionales, museos y ferias
              internacionales de Argentina, Francia, Luxemburgo, España y Uruguay.
            </p>
          </div>
        </section>

        {/* ── Síntesis ──────────────────────────────────────── */}
        <section className="px-5 md:px-8 py-16 md:py-20 border-b border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {SINTESIS.map(({ valor, detalle }) => (
              <div key={valor} className="flex flex-col gap-2">
                <span className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-accent)] leading-none">
                  {valor}
                </span>
                <span className="text-xs md:text-sm text-[var(--color-muted)] leading-snug">
                  {detalle}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Distinciones ──────────────────────────────────── */}
        <section id="distinciones" data-subsection className="px-5 md:px-8 py-16 md:py-20 border-b border-[var(--color-border)] scroll-mt-32">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <Eyebrow>Distinciones y premios</Eyebrow>
            <div className="flex items-start gap-5">
              <span className="shrink-0 font-[family-name:var(--font-cormorant)] font-light text-3xl md:text-4xl text-[var(--color-accent)] leading-none pt-1">
                2025
              </span>
              <p className="text-base md:text-lg text-[var(--color-text)]/90 leading-relaxed">
                Segundo Premio a la Creación Artística (categoría Pintura), Universidad de
                Belgrano. Obra galardonada:{" "}
                <em className="text-[var(--color-text)]">«El Principito Aviador»</em> (Argentina).
              </p>
            </div>
          </div>
        </section>

        {/* ── Cronología / trayectoria ──────────────────────── */}
        <section id="trayectoria" data-subsection className="px-5 md:px-8 py-16 md:py-24 border-b border-[var(--color-border)] scroll-mt-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <Eyebrow>Exposiciones y participaciones seleccionadas</Eyebrow>
              <Titulo>Trayectoria</Titulo>
            </div>

            <ol className="flex flex-col">
              {TRAYECTORIA.map(({ anio, nota, eventos }) => (
                <li
                  key={anio}
                  className="grid grid-cols-1 md:grid-cols-[7rem_1fr] gap-4 md:gap-8 py-8 border-t border-[var(--color-border)] first:border-t-0"
                >
                  {/* Año */}
                  <div className="md:sticky md:top-24 md:self-start">
                    <span className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-accent)] leading-none">
                      {anio}
                    </span>
                    {nota && (
                      <span className="block mt-2 text-[10px] tracking-[0.2em] uppercase text-[var(--color-accent-2)]">
                        {nota}
                      </span>
                    )}
                  </div>

                  {/* Eventos del año */}
                  <ul className="flex flex-col gap-4">
                    {eventos.map(({ titulo, lugar, pais }, i) => (
                      <li key={i} className="flex flex-col gap-0.5">
                        <span className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--color-text)] leading-snug">
                          {titulo}
                        </span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {lugar}
                          {pais && (
                            <span className="text-[var(--color-muted)]/70"> · {pais}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Formación ─────────────────────────────────────── */}
        <section id="formacion" data-subsection className="px-5 md:px-8 py-16 md:py-24 border-b border-[var(--color-border)] scroll-mt-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Eyebrow>Formación académica y campos de estudio</Eyebrow>
              <Titulo>Formación</Titulo>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {FORMACION.map(({ titulo, detalle }) => (
                <div key={titulo} className="flex flex-col gap-2 border-l border-[var(--color-border)] pl-5">
                  <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
                    {titulo}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {detalle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Producción interdisciplinaria ─────────────────── */}
        <section id="obra" data-subsection className="section-cool px-5 md:px-8 py-16 md:py-24 scroll-mt-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Eyebrow>Producción interdisciplinaria relevante</Eyebrow>
              <Titulo>Obra y colección</Titulo>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)]">
                  Producción literaria
                </h3>
                <p className="text-base text-[var(--color-text)]/90 leading-relaxed">
                  Autor de la novela de fantasía y misticismo{" "}
                  <em>«El Aprendiz: Ciudad Intradorada»</em>, presentada institucionalmente
                  en la Feria Internacional del Libro de Buenos Aires.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)]">
                  Producción musical
                </h3>
                <p className="text-base text-[var(--color-text)]/90 leading-relaxed">
                  Compositor, arreglista y productor de ocho álbumes de estudio distribuidos
                  globalmente: seis de Rock Pop Electrónico y dos de mantras y música
                  meditativa.
                </p>
              </div>
            </div>

            <h3 className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] mb-6">
              Obras clave · colección privada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {OBRAS_CLAVE.map(({ titulo, ficha }) => (
                <div
                  key={titulo}
                  className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4"
                >
                  <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--color-text)]">
                    «{titulo}»
                  </span>
                  <span className="text-xs text-[var(--color-muted)] leading-relaxed">
                    {ficha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
