import Header from "@/components/layout/Header";

export const metadata = { title: "Contacto — Santiago Azcuy" };

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 px-8 max-w-3xl mx-auto w-full">
        <h2 className="font-[family-name:var(--font-cormorant)] font-light text-5xl text-[var(--color-text)] mb-2">
          Contacto
        </h2>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)] mb-16">
          Consultas y adquisiciones
        </p>
        <p className="text-[var(--color-muted)] text-sm">Próximamente.</p>
      </main>
    </>
  );
}
