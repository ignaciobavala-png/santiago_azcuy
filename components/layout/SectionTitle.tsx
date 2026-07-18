/**
 * Encabezado de sección: reemplaza al SectionHero (que traía su propio banner).
 * Ahora el banner es el escritorio global; la sección solo necesita su título.
 */
export default function SectionTitle({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string
  title: string
  className?: string
}) {
  return (
    <div className={`mb-12 md:mb-16 ${className}`}>
      {eyebrow && (
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
          {eyebrow}
        </p>
      )}
      <h1 className="font-[family-name:var(--font-cormorant)] font-light text-5xl md:text-6xl leading-none text-[var(--color-text)]">
        {title}
      </h1>
    </div>
  )
}
