import { Suspense } from "react"
import SiteIndex from "@/components/layout/SiteIndex"
import DesktopBackground from "@/components/layout/DesktopBackground"
import ConditionalFooter from "@/components/layout/ConditionalFooter"
import JsonLd from "@/components/seo/JsonLd"
import { personSchema, websiteSchema } from "@/lib/seo"
import { getBanners, getHomeCardImages } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"

/**
 * Layout persistente del sitio público.
 * - DesktopBackground: el carrusel de banners como "escritorio" fijo detrás de todo.
 * - SiteIndex: el índice de navegación (cards) que se mantiene montado entre
 *   navegaciones; el home queda fijo y cada sección se abre encima.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [banners, cardImages] = await Promise.all([getBanners(), getHomeCardImages()])

  return (
    <>
      <JsonLd data={[personSchema(), websiteSchema()]} />
      <DesktopBackground banners={banners} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <SiteIndex banners={banners} cardImages={cardImages} />
        </Suspense>
        <main id="section-content" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </div>
    </>
  )
}
