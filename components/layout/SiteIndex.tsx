"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import CardVideoPreview from "./CardVideoPreview"
import { SECTION_TREE, findSection } from "./sectionTree"
import type { Banner } from "@/lib/supabase/queries"

/**
 * Índice de navegación persistente (vive en el layout, no se desmonta al navegar).
 * File explorer sobre el escritorio (DesktopBackground):
 * - En "/" : todas las cards grandes centradas sobre el banner.
 * - Al entrar a una card : las demás se borran, la card entrada hace morph a una
 *   barra superior (breadcrumb + subsecciones). El fondo sigue vivo detrás.
 */
export default function SiteIndex({ banners, cardImages }: { banners: Banner[]; cardImages: Record<string, string> }) {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const active = findSection(pathname)
  const activeIdx = active ? SECTION_TREE.findIndex((s) => s.href === active.href) : -1
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeSub = !isHome && active && active.subs.length > 0
    ? (searchParams.get("sub") || active.subs[0].anchor)
    : null

  const bannerFor = (idx: number) => (banners.length ? banners[idx % banners.length] : null)

  const cardInner = (idx: number) => {
    const href = SECTION_TREE[idx]?.href
    return (
      <>
        <CardVideoPreview banner={bannerFor(idx)} imagenUrl={href ? cardImages[href] ?? null : null} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
      </>
    )
  }

  return (
    <LayoutGroup>
      {/* ── ESCRITORIO (home): todas las cards ─────────────────────── */}
      <AnimatePresence initial={false}>
        {isHome && (
          <motion.section
            key="desktop"
            className="relative min-h-screen w-full"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Firma */}
            <div className="absolute top-4 left-6 md:left-10 z-20">
              <Link href="/" aria-label="Santiago Azcuy — Inicio" className="opacity-90 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-altacalidad.png"
                  alt="Santiago Azcuy"
                  width={480}
                  height={320}
                  priority
                  className="h-20 md:h-28 w-auto object-contain brightness-0 invert"
                />
              </Link>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-28">
              <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-5 w-full max-w-6xl">
                {SECTION_TREE.map((node, idx) => (
                  <motion.div
                    key={node.href}
                    layoutId={`card-${node.href}`}
                    className="min-w-0"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  >
                    <Link href={node.href} className="group flex flex-col items-center">
                      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl border border-white/15 bg-black/35 backdrop-blur-md transition-all duration-500 group-hover:border-[var(--color-accent-2)]/70 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_-12px_rgba(134,197,202,0.5)]">
                        {cardInner(idx)}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/25 text-white/80 bg-black/25 transition-all duration-500 group-hover:border-[var(--color-accent-2)] group-hover:text-[var(--color-accent-2)] group-hover:scale-110 group-hover:opacity-0">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 translate-x-[1px]" fill="currentColor" aria-hidden>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <span className="mt-3 font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-white/90 transition-colors duration-300 group-hover:text-[var(--color-accent-2)]">
                        {node.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── SECCIÓN: barra con la card activa + breadcrumb + subsecciones ── */}
      <AnimatePresence initial={false}>
        {!isHome && active && (
          <motion.header
            key="bar"
            className="sticky top-0 z-50 bg-[var(--color-background)]/70 backdrop-blur-md border-b border-[var(--color-border)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-3 md:gap-4 px-4 md:px-8 py-2.5">
              {/* Firma → escritorio */}
              <Link href="/" aria-label="Volver al escritorio" className="shrink-0 opacity-90 hover:opacity-100 transition-opacity">
                <Image
                  src="/logo-altacalidad.png"
                  alt="Santiago Azcuy"
                  width={480}
                  height={320}
                  className="h-11 md:h-12 w-auto object-contain brightness-0 invert"
                />
              </Link>

              {/* Card activa (morph desde el escritorio) */}
              <motion.div
                layoutId={`card-${active.href}`}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="shrink-0"
              >
                <Link href={active.href} aria-label={active.label}>
                  <div className="relative w-10 h-[3.4rem] md:w-11 md:h-[3.75rem] overflow-hidden rounded-md border border-[var(--color-accent-2)]/60 bg-black/40 shadow-[0_4px_16px_-6px_rgba(134,197,202,0.6)]">
                    {cardInner(activeIdx >= 0 ? activeIdx : 0)}
                  </div>
                </Link>
              </motion.div>

              {/* Breadcrumb + chips de subsección */}
              <div className="min-w-0 flex-1">
                <nav className="flex items-center gap-1.5 text-[10px] md:text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                  <Link href="/" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                    <span aria-hidden>⌂</span> Escritorio
                  </Link>
                  <span className="opacity-50">/</span>
                  <span className="text-[var(--color-text)] truncate">{active.label}</span>
                  {activeSub && (
                    <>
                      <span className="opacity-50">/</span>
                      <span className="text-[var(--color-accent-2)] truncate">
                        {active.subs.find((s) => s.anchor === activeSub)?.label}
                      </span>
                    </>
                  )}
                </nav>

                {active.subs.length > 0 && (
                  <div className="mt-1.5 flex gap-2 overflow-x-auto no-scrollbar">
                    {active.subs.map((s) => {
                      const on = activeSub === s.anchor
                      return (
                        <button
                          key={s.anchor}
                          type="button"
                          onClick={() => router.push(`${active!.href}?sub=${s.anchor}`, { scroll: false })}
                          className={`shrink-0 rounded-full border px-3 py-0.5 text-[10px] tracking-[0.12em] uppercase transition-colors ${
                            on
                              ? "border-[var(--color-accent-2)] text-[var(--color-accent-2)]"
                              : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                          }`}
                        >
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
