/**
 * Constructores de datos estructurados schema.org (JSON-LD).
 * Se renderizan con <JsonLd> (components/seo/JsonLd.tsx).
 */
import { siteConfig } from "@/lib/site"
import type { Obra } from "@/lib/supabase/queries"

type Json = Record<string, unknown>

const AUTOR = { "@type": "Person", name: "Santiago Azcuy" }

/** Entidad principal del sitio — se emite en todas las páginas públicas. */
export function personSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Santiago Azcuy",
    url: siteConfig.url,
    jobTitle: "Artista plástico",
    nationality: "Argentina",
    description: siteConfig.description,
    ...(siteConfig.sameAs.length ? { sameAs: siteConfig.sameAs } : {}),
  }
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "es-AR",
    author: AUTOR,
  }
}

/** Obra pictórica → apto para resultados enriquecidos de arte. */
export function artworkSchema(obra: Obra): Json {
  const url = `${siteConfig.url}/obras/${obra.slug}`
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: obra.titulo,
    url,
    creator: AUTOR,
    inLanguage: "es-AR",
    ...(obra.imagen_url ? { image: obra.imagen_url } : {}),
    ...(obra.descripcion ? { description: obra.descripcion } : {}),
    ...(obra.tecnica ? { artMedium: obra.tecnica, artform: obra.tecnica } : {}),
    ...(obra.año ? { dateCreated: String(obra.año) } : {}),
    ...(obra.dimensiones ? { size: obra.dimensiones } : {}),
    ...(obra.disponible && obra.precio
      ? {
          offers: {
            "@type": "Offer",
            price: Number(obra.precio),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  }
}

/** Novela «El Aprendiz». */
export function bookSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "El Aprendiz: Ciudad Intradorada",
    author: AUTOR,
    inLanguage: "es",
    bookFormat: "https://schema.org/EBook",
    genre: "Fantasía y misticismo",
    url: `${siteConfig.url}/el-aprendiz`,
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteConfig.url}${it.path}`,
    })),
  }
}
