"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Obras", href: "/obras" },
  { label: "Dossier", href: "/dossier" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-12 py-6 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--color-background)]/95 backdrop-blur-sm border-b border-[var(--color-border)]"
            : "bg-transparent"
        }`}
      >
        {/* Nombre del artista */}
        <Link
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl italic tracking-wide text-white hover:text-[var(--color-accent)] transition-colors duration-300"
        >
          Santiago Azcuy
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="relative text-[11px] tracking-[0.25em] uppercase text-white/80 hover:text-white transition-colors duration-300 after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-px after:bg-[var(--color-accent)] after:transition-all after:duration-300 hover:after:w-full"
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
          <span className={`block w-5 h-px bg-white transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--color-background)] flex flex-col items-center justify-center gap-10 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <p className="font-[family-name:var(--font-cormorant)] text-sm italic tracking-wide text-[var(--color-muted)] mb-4">
          Santiago Azcuy
        </p>
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
    </>
  );
}
