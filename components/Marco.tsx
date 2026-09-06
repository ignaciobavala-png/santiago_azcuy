import Link from "next/link";

const SECCIONES = [
  { href: "/obras", nombre: "Obras" },
  { href: "/musica", nombre: "Música" },
  { href: "/libro", nombre: "El Aprendiz" },
  { href: "/arquitectura", nombre: "Arquitectura" },
  { href: "/sobre", nombre: "Sobre" },
];

export function Cabecera() {
  return (
    <header className="sticky top-0 z-50 border-b border-linea bg-papel/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1600px] items-baseline gap-6 px-5 py-4 md:px-10">
        <Link href="/" className="etiqueta shrink-0 hover:opacity-55">
          Santiago Azcuy
        </Link>
        <ul className="ml-auto flex gap-5 overflow-x-auto md:gap-8">
          {SECCIONES.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="etiqueta whitespace-nowrap text-tinta-media transition-colors hover:text-tinta"
              >
                {s.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function Pie() {
  return (
    <footer className="mt-32 border-t border-linea">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <p className="titular max-w-xl">
          Pintura, música,
          <br />
          arquitectura y palabra.
        </p>
        <p className="etiqueta text-tinta-suave">
          © {new Date().getFullYear()} Santiago Azcuy
        </p>
      </div>
    </footer>
  );
}
