import Header from "@/components/layout/Header";

export const metadata = { title: "Sobre el artista — Santiago Azcuy" };

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 px-8 max-w-3xl mx-auto w-full">
        <h2 className="font-[family-name:var(--font-cormorant)] font-light text-5xl text-[var(--color-text)] mb-2">
          Santiago Azcuy
        </h2>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)] mb-16">
          Artista plástico · Buenos Aires
        </p>
        <p className="text-[var(--color-muted)] text-sm">Próximamente.</p>
      </main>
    </>
  );
}
