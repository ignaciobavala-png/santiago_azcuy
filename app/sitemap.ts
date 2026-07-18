import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"
import { getObras, getSeries } from "@/lib/supabase/queries"

// Lee slugs desde Supabase (usa cookies) → render dinámico.
export const dynamic = "force-dynamic"

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/obras", priority: 0.9 },
  { path: "/series", priority: 0.8 },
  { path: "/el-aprendiz", priority: 0.8 },
  { path: "/musica", priority: 0.7 },
  { path: "/institucional", priority: 0.7 },
  { path: "/dossier", priority: 0.6 },
  { path: "/sobre", priority: 0.6 },
  { path: "/contacto", priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [obras, series] = await Promise.all([getObras(), getSeries()])
  const lastModified = new Date()

  const staticEntries = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }))

  const obraEntries = obras.map((o) => ({
    url: `${siteConfig.url}/obras/${o.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const serieEntries = series.map((s) => ({
    url: `${siteConfig.url}/series/${s.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...obraEntries, ...serieEntries]
}
