import SectionTitle from "@/components/layout/SectionTitle"
import { ContactoForm } from "./ContactoForm"

export const metadata = {
  title: "Contacto",
  description: "Consultas, adquisiciones y comisiones de obra de Santiago Azcuy, artista plástico argentino.",
  alternates: { canonical: "/contacto" },
}

export default function ContactoPage() {
  return (
    <div className="pt-16 pb-24 px-5 md:px-8 max-w-3xl mx-auto w-full">
      <SectionTitle eyebrow="Consultas y adquisiciones" title="Contacto" />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
              Email
            </p>
            <a
              href="mailto:santiago@azcuy.art"
              className="text-sm text-[var(--color-text)]/80 hover:text-[var(--color-accent)] transition-colors"
            >
              santiago@azcuy.art
            </a>
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
              Instagram
            </p>
            <a
              href="https://instagram.com/santiagoazcuy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-text)]/80 hover:text-[var(--color-accent)] transition-colors"
            >
              @santiagoazcuy
            </a>
          </div>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            Para consultas sobre obras, adquisiciones, comisiones o prensa, completá el formulario.
          </p>
        </div>

        <ContactoForm />
      </div>
    </div>
  )
}
