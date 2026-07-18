import SectionTitle from "@/components/layout/SectionTitle";

export const metadata = {
  title: "Contacto",
  description: "Consultas, adquisiciones y comisiones de obra de Santiago Azcuy, artista plástico argentino.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <div className="pt-16 pb-24 px-5 md:px-8 max-w-3xl mx-auto w-full">
      <SectionTitle eyebrow="Consultas y adquisiciones" title="Contacto" />
      <p className="text-[var(--color-muted)] text-sm">Próximamente.</p>
    </div>
  );
}
