"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Obras", href: "/obras" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)] backdrop-blur-sm bg-[var(--color-background)]/80">
        <Link
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.3em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          Santiago Azcuy
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          <span className={`block w-5 h-px bg-[var(--color-text)] transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block w-5 h-px bg-[var(--color-text)] transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-[var(--color-text)] transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--color-background)] flex flex-col items-center justify-center gap-10 md:hidden">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
