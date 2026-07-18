import Link from "next/link"
import { getBannersAdmin } from "./actions"
import BannersPanel from "./BannersPanel"

export const dynamic = "force-dynamic"
export const metadata = { title: "Fondo del sitio — Admin" }

export default async function FondoPage() {
  const banners = await getBannersAdmin()

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-1">Escritorio</p>
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Fondo del sitio
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-2 max-w-xl">
          Videos que se ven de fondo en todo el sitio (el &ldquo;escritorio&rdquo;). Rotan
          automáticamente uno tras otro. Podés subir varios, ordenarlos y activar/ocultar cada uno.
        </p>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 mt-3 text-[10px] tracking-[0.2em] uppercase text-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors"
        >
          Ver en el sitio ↗
        </Link>
      </div>

      <BannersPanel banners={banners} />
    </div>
  )
}
