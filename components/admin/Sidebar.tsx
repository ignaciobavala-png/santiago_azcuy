"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/login/actions";

const NAV = [
  {
    label: "Panel",
    href: "/admin",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Hero",
    href: "/admin/hero",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: "Colecciones",
    href: "/admin/colecciones",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    label: "Obras",
    href: "/admin/obras",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    label: "Biografía",
    href: "/admin/biografia",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Contacto",
    href: "/admin/contacto",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-[var(--color-border)]">
        <Link href="/" className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.25em] uppercase text-[var(--color-text)]">
          Santiago Azcuy
        </Link>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] mt-0.5">
          Panel de control
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {NAV.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-[0.15em] uppercase transition-colors ${
              isActive(href)
                ? "bg-[var(--color-border)] text-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/50"
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer: ver sitio + cerrar sesión */}
      <div className="px-6 py-5 border-t border-[var(--color-border)] flex flex-col gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver sitio
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
