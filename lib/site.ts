/**
 * Configuración central del sitio — fuente única para SEO (metadata, sitemap,
 * robots, Open Graph y datos estructurados JSON-LD).
 */

/** Base canónica. En dev usa NEXT_PUBLIC_SITE_URL (localhost); en producción
 *  cae al dominio real si la variable no está seteada. Sin barra final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://santiagoazcuy.art"
).replace(/\/$/, "")

export const siteConfig = {
  name: "Santiago Azcuy",
  title: "Santiago Azcuy — Artista plástico argentino",
  description:
    "Santiago Azcuy, artista plástico argentino. Pintura en óleo, acrílico y técnica mixta con impronta simbólica y geometría sagrada. Obra, series, música y la novela «El Aprendiz».",
  url: SITE_URL,
  locale: "es_AR",
  keywords: [
    "Santiago Azcuy",
    "artista plástico argentino",
    "pintura contemporánea",
    "óleo",
    "acrílico",
    "técnica mixta",
    "arte argentino",
    "geometría sagrada",
    "arte simbólico",
    "Buenos Aires",
    "El Aprendiz Ciudad Intradorada",
  ],
  // Redes sociales del artista → alimentan sameAs (JSON-LD) y Twitter card.
  // Agregar acá las URLs de perfil (Instagram, YouTube, Spotify) cuando estén.
  sameAs: [] as string[],
} as const
