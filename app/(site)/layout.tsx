import SiteIndex from "@/components/layout/SiteIndex"
import DesktopBackground from "@/components/layout/DesktopBackground"
import ConditionalFooter from "@/components/layout/ConditionalFooter"
import { getBanners } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"

/**
 * Layout persistente del sitio público.
 * - DesktopBackground: el carrusel de banners como "escritorio" fijo detrás de todo.
 * - SiteIndex: el índice de navegación (cards) que se mantiene montado entre
 *   navegaciones; el home queda fijo y cada sección se abre encima.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const banners = await getBanners()

  return (
    <>
      <DesktopBackground banners={banners} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteIndex banners={banners} />
        <main id="section-content" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </div>
    </>
  )
}
