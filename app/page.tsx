import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ObraCard from "@/components/gallery/ObraCard";

// Mock — reemplazar con query a Supabase
const COLECCIONES = [
  {
    slug: "introspecciones",
    nombre: "Introspecciones",
    año: "2022–2023",
    descripcion: "Exploración del espacio interior y la memoria.",
    obras: [
      { slug: "sin-titulo-i", titulo: "Sin título I", año: 2023, tecnica: "Óleo", dimensiones: "120 × 90 cm", disponible: true },
      { slug: "sin-titulo-ii", titulo: "Sin título II", año: 2023, tecnica: "Óleo", dimensiones: "90 × 70 cm", disponible: false },
      { slug: "latencia", titulo: "Latencia", año: 2022, tecnica: "Técnica mixta", dimensiones: "150 × 110 cm", disponible: true },
    ],
  },
  {
    slug: "materia-y-tiempo",
    nombre: "Materia y tiempo",
    año: "2021",
    descripcion: "Diálogo entre el soporte físico y la temporalidad.",
    obras: [
      { slug: "fragmento", titulo: "Fragmento", año: 2021, tecnica: "Acrílico", dimensiones: "100 × 80 cm", disponible: false },
      { slug: "estrato", titulo: "Estrato", año: 2021, tecnica: "Óleo", dimensiones: "80 × 60 cm", disponible: true },
      { slug: "umbral", titulo: "Umbral", año: 2021, tecnica: "Técnica mixta", dimensiones: "120 × 100 cm", disponible: false },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">

        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-8 text-center">
          <p className="font-[family-name:var(--font-cormorant)] text-xs tracking-[0.5em] uppercase text-[var(--color-accent)] mb-6">
            Artista
          </p>
          <h1
            className="font-[family-name:var(--font-cormorant)] font-light leading-none tracking-tight text-[var(--color-text)]"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            Santiago
            <br />
            Azcuy
          </h1>
          <div className="mt-8 w-12 h-px bg-[var(--color-accent)] mx-auto" />
          <p className="mt-8 text-xs tracking-[0.25em] uppercase text-[var(--color-muted)]">
            Buenos Aires · Argentina
          </p>
          <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">Explorar</span>
            <div className="w-px h-8 bg-[var(--color-muted)]" />
          </div>
        </section>

        {/* ── OBRA POR COLECCIÓN ─────────────────────────────── */}
        {COLECCIONES.map((col, idx) => (
          <section
            key={col.slug}
            className={`px-8 py-24 max-w-7xl mx-auto w-full ${idx > 0 ? "border-t border-[var(--color-border)]" : ""}`}
          >
            {/* Encabezado de colección */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">
                  Colección · {col.año}
                </p>
                <h2 className="font-[family-name:var(--font-cormorant)] font-light text-4xl md:text-5xl text-[var(--color-text)]">
                  {col.nombre}
                </h2>
                {col.descripcion && (
                  <p className="text-sm text-[var(--color-muted)] mt-2 max-w-md">{col.descripcion}</p>
                )}
              </div>
              <Link
                href={`/obras?coleccion=${col.slug}`}
                className="hidden md:inline-flex text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-b border-[var(--color-border)] pb-0.5 hover:border-[var(--color-text)]"
              >
                Ver colección
              </Link>
            </div>

            {/* Grid de obras */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {col.obras.map((obra) => (
                <ObraCard key={obra.slug} {...obra} />
              ))}
            </div>
          </section>
        ))}

        {/* ── STATEMENT ──────────────────────────────────────── */}
        <section className="px-8 py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-[family-name:var(--font-cormorant)] font-light text-2xl md:text-3xl leading-relaxed text-[var(--color-text)] italic">
              "La pintura es el lenguaje con el que traduzco lo que las palabras
              no pueden alcanzar."
            </p>
            <div className="mt-8 w-8 h-px bg-[var(--color-accent)] mx-auto" />
            <Link
              href="/sobre"
              className="mt-6 inline-block text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Sobre el artista
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
