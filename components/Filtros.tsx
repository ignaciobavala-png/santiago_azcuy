"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ETIQUETA, type Categoria } from "@/lib/tipos";

/**
 * Categoria y encargo son ejes independientes: un encargo puede ser figurativo
 * o abstracto. Por eso se combinan en la URL en vez de excluirse.
 */
export function Filtros({ conteos }: { conteos: Record<string, number> }) {
  const params = useSearchParams();
  const ruta = usePathname();
  const cat = params.get("categoria");
  const encargo = params.get("encargo") === "1";

  const href = (cambios: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `${ruta}?${s}` : ruta;
  };

  const chip = (activo: boolean) =>
    `etiqueta rounded-full border px-3.5 py-1.5 transition-colors ${
      activo
        ? "border-tinta bg-tinta text-papel"
        : "border-linea text-tinta-media hover:border-tinta-suave hover:text-tinta"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={href({ categoria: null })} className={chip(!cat)}>
        Todo <span className="opacity-50">{conteos.total}</span>
      </Link>

      {(Object.keys(ETIQUETA) as Categoria[]).map((c) =>
        conteos[c] ? (
          <Link key={c} href={href({ categoria: c })} className={chip(cat === c)}>
            {ETIQUETA[c]} <span className="opacity-50">{conteos[c]}</span>
          </Link>
        ) : null
      )}

      <span className="mx-1 h-4 w-px bg-linea" aria-hidden />

      <Link href={href({ encargo: encargo ? null : "1" })} className={chip(encargo)}>
        Por encargo
      </Link>
    </div>
  );
}
