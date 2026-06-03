import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Mock data — reemplazar con query a Supabase
const OBRAS: Record<string, {
  slug: string;
  titulo: string;
  año: number;
  tecnica: string;
  soporte: string;
  dimensiones: string;
  serie: string;
  descripcion: string;
  disponible: boolean;
  precio: number | null;
  imagenUrl: string | null;
}> = {
  "sin-titulo-i": {
    slug: "sin-titulo-i",
    titulo: "Sin título I",
    año: 2023,
    tecnica: "Óleo",
    soporte: "Tela de lino",
    dimensiones: "120 × 90 cm",
    serie: "Introspecciones",
    descripcion:
      "Una exploración del vacío como presencia. La superficie acumula capas de materia que se niegan a resolverse en forma definitiva, suspendiendo al espectador entre lo que fue y lo que podría ser. El gesto pictórico aparece y desaparece bajo veladuras sucesivas.",
    disponible: true,
    precio: 1800,
    imagenUrl: null,
  },
  "fragmento": {
    slug: "fragmento",
    titulo: "Fragmento",
    año: 2022,
    tecnica: "Acrílico",
    soporte: "Tela de algodón",
    dimensiones: "100 × 80 cm",
    serie: "Materia y tiempo",
    descripcion:
      "La obra interroga la noción de integridad. Un fragmento que, lejos de sugerir incompletitud, propone una totalidad propia. La textura cruda del soporte dialoga con la densidad del pigmento en una tensión que no busca resolución.",
    disponible: false,
    precio: null,
    imagenUrl: null,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const obra = OBRAS[slug];
  if (!obra) return {};
  return {
    title: `${obra.titulo} — Santiago Azcuy`,
    description: obra.descripcion.slice(0, 160),
  };
}

export default async function ObraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const obra = OBRAS[slug];
  if (!obra) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] mb-10">
            <Link href="/obras" className="hover:text-[var(--color-text)] transition-colors">
              Obras
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">{obra.titulo}</span>
          </nav>

          {/* Layout: imagen izq + info der */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

            {/* ── IMAGEN ─────────────────────────────────────── */}
            <div className="sticky top-28">
              <div
                className="w-full bg-[var(--color-surface)] flex items-center justify-center"
                style={{ aspectRatio: "3/4" }}
              >
                {obra.imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={obra.imagenUrl}
                    alt={obra.titulo}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
                    Imagen próximamente
                  </span>
                )}
              </div>
            </div>

            {/* ── INFO ───────────────────────────────────────── */}
            <div className="flex flex-col gap-10 pt-2">

              {/* Título y año */}
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
                  {obra.serie}
                </p>
                <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl leading-tight text-[var(--color-text)]">
                  {obra.titulo}
                </h1>
                <p className="text-[var(--color-muted)] mt-2 text-sm">{obra.año}</p>
              </div>

              {/* Descripción */}
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[var(--color-text)]/80">
                  {obra.descripcion}
                </p>
              </div>

              {/* Ficha técnica */}
              <div className="border-t border-[var(--color-border)] pt-8">
                <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-5">
                  Ficha técnica
                </p>
                <dl className="flex flex-col gap-3">
                  {[
                    { label: "Técnica", value: obra.tecnica },
                    { label: "Soporte", value: obra.soporte },
                    { label: "Dimensiones", value: obra.dimensiones },
                    { label: "Año", value: String(obra.año) },
                    { label: "Serie", value: obra.serie },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-baseline gap-4">
                      <dt className="text-xs tracking-[0.15em] uppercase text-[var(--color-muted)] w-28 shrink-0">
                        {label}
                      </dt>
                      <dd className="text-sm text-[var(--color-text)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Precio y CTA */}
              <div className="border-t border-[var(--color-border)] pt-8">
                {obra.disponible ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]">
                        Disponible
                      </span>
                    </div>
                    {obra.precio && (
                      <p className="font-[family-name:var(--font-cormorant)] text-4xl text-[var(--color-text)]">
                        USD {obra.precio.toLocaleString()}
                      </p>
                    )}
                    <Link
                      href={`/contacto?obra=${obra.slug}`}
                      className="inline-flex items-center justify-center h-12 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors duration-300"
                    >
                      Consultar adquisición
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">
                      Incluye certificado de autenticidad. Envío a consultar.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
                      No disponible
                    </p>
                    <Link
                      href="/contacto"
                      className="inline-flex items-center justify-center h-12 px-8 border border-[var(--color-border)] text-[var(--color-muted)] text-xs tracking-[0.2em] uppercase hover:border-[var(--color-text)] hover:text-[var(--color-text)] transition-colors duration-300"
                    >
                      Consultar al artista
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
