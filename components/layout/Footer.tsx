import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] px-5 md:px-8 py-12 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--color-text)]">
            Santiago Azcuy
          </p>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
            Artista plástico · Buenos Aires
          </p>
        </div>

        <nav className="flex flex-wrap gap-6">
          {[
            { label: "Pinturas", href: "/obras" },
            { label: "El Aprendiz", href: "/el-aprendiz" },
            { label: "Música", href: "/musica" },
            { label: "Institucional", href: "/institucional" },
            { label: "Sobre", href: "/sobre" },
            { label: "Contacto", href: "/contacto" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} Santiago Azcuy
        </p>
      </div>
    </footer>
  );
}
