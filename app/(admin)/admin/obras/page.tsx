import Link from "next/link";
import { exigirAdmin } from "@/lib/admin/sesion";
import { obrasAdmin } from "@/lib/admin/datos";
import { FilaObra } from "@/components/admin/FilaObra";
import { CATEGORIAS, type Categoria } from "@/lib/tipos";

export const dynamic = "force-dynamic";

const VALIDAS = new Set<string>([...CATEGORIAS, "sin"]);

type P = Record<string, string | string[] | undefined>;

function v(p: P, k: string): string {
  const x = p[k];
  return typeof x === "string" ? x : "";
}

/**
 * Lista del panel. El buscador y los filtros viven en la URL (params GET),
 * igual que en la parte publica, para que cada combinacion sea copiable y el
 * estado no dependa de un componente cliente.
 */
export default async function Obras({ searchParams }: { searchParams: Promise<P> }) {
  await exigirAdmin();
  const p = await searchParams;

  const q = v(p, "q").trim();
  const categoria = v(p, "categoria");
  const ocultas = p.ocultas === "1";
  const encargo = p.encargo === "1";
  const sinTitulo = p.sintitulo === "1";
  const sinAnio = p.sinanio === "1";
  const sinFicha = p.sinficha === "1";
  const destacadas = p.destacadas === "1";
  const ok = p.ok === "1";

  const lista = await obrasAdmin({
    q: q || undefined,
    categoria: VALIDAS.has(categoria) ? (categoria as Categoria | "sin") : undefined,
    soloOcultas: ocultas || undefined,
    soloEncargos: encargo || undefined,
    sinTitulo: sinTitulo || undefined,
    sinAnio: sinAnio || undefined,
    sinFicha: sinFicha || undefined,
    soloDestacadas: destacadas || undefined,
  });

  const href = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const base: Record<string, string> = {
      q,
      categoria,
      ocultas: p.ocultas as string,
      encargo: p.encargo as string,
      sintitulo: p.sintitulo as string,
      sinanio: p.sinanio as string,
      sinficha: p.sinficha as string,
      destacadas: p.destacadas as string,
    };
    for (const [k, val] of Object.entries({ ...base, ...cambios })) {
      if (val && val !== "0") params.set(k, val);
    }
    const s = params.toString();
    return s ? `/admin/obras?${s}` : "/admin/obras";
  };

  const chip = (activo: boolean) =>
    `etiqueta rounded-full border px-3 py-1.5 transition-colors ${
      activo ? "border-tinta bg-tinta text-papel" : "border-linea text-tinta-media hover:border-tinta-suave hover:text-tinta"
    }`;

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular">Obras</h1>
        <Link href="/admin/obras/nueva" className="etiqueta border border-linea px-4 py-2 hover:border-tinta-media">
          Nueva obra +
        </Link>
      </header>

      {ok && (
        <p className="mt-5 border-y border-linea bg-papel-alt px-3 py-2 text-sm">Cambios guardados.</p>
      )}

      <form method="get" action="/admin/obras" className="mt-6 flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título…"
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none placeholder:text-tinta-suave focus:border-tinta-media"
        />
        <button type="submit" className="rounded-md border border-linea px-4 text-sm hover:border-tinta-media">
          Buscar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={href({ categoria: null, ocultas: null, encargo: null, sintitulo: null, sinanio: null, sinficha: null, destacadas: null })}
          className={chip(!categoria && !ocultas && !encargo && !sinTitulo && !sinAnio && !sinFicha && !destacadas)}>
          Todas
        </Link>
        {CATEGORIAS.map((c) => (
          <Link key={c} href={href({ categoria: c, ocultas: null, encargo: null, sintitulo: null, sinanio: null, sinficha: null, destacadas: null })} className={chip(categoria === c)}>
            {c}
          </Link>
        ))}
        <Link href={href({ categoria: "sin", ocultas: null, encargo: null, sintitulo: null, sinanio: null, sinficha: null, destacadas: null })} className={chip(categoria === "sin")}>
          Sin categoría
        </Link>
        <span className="mx-1 h-4 w-px bg-linea" aria-hidden />
        <Link href={href({ ocultas: ocultas ? null : "1" })} className={chip(ocultas)}>
          Sin publicar
        </Link>
        <Link href={href({ encargo: encargo ? null : "1" })} className={chip(encargo)}>
          Encargos
        </Link>
        <Link href={href({ sinanio: sinAnio ? null : "1" })} className={chip(sinAnio)}>
          Sin año
        </Link>

        <Link href={href({ sinficha: sinFicha ? null : "1" })} className={chip(sinFicha)}>
          Sin técnica o medidas
        </Link>

        <Link href={href({ destacadas: destacadas ? null : "1" })} className={chip(destacadas)}>
          Destacadas
        </Link>

        <Link href={href({ sintitulo: sinTitulo ? null : "1" })} className={chip(sinTitulo)}>
          Sin título
        </Link>
      </div>

      <section className="mt-8 border-t border-linea">
        {lista.length === 0 ? (
          <p className="py-16 text-tinta-media">No hay obras que combinen esos filtros.</p>
        ) : (
          lista.map((o) => <FilaObra key={o.id} obra={o} />)
        )}
        <p className="etiqueta py-4 text-tinta-suave">{lista.length} obras</p>
      </section>
    </main>
  );
}
