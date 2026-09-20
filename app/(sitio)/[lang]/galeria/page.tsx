import Link from "next/link";
import type { Metadata } from "next";
import { CategoriaCard } from "@/components/CategoriaCard";
import { Filtros } from "@/components/Filtros";
import { ObraCard } from "@/components/ObraCard";
import { obras, conteos } from "@/lib/consultas";
import { fmt, ruta, type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";
import { CATEGORIAS, type Categoria } from "@/lib/tipos";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: (await dic((await params).lang)).obras.titulo };
}

const VALIDAS = new Set<string>(CATEGORIAS);

/** La categoria real de la obra (figurativo/abstracto/dibujo), o la seccion
 *  virtual "encargos": no es un valor de `categoria` en la base, es un cruce
 *  por `es_encargo` que se muestra como si fuera una categoria mas. */
type Seccion = Categoria | "encargos";

export default async function Galeria({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Lang }>;
  searchParams: Promise<{ categoria?: string; encargo?: string }>;
}) {
  const [{ lang }, p] = await Promise.all([params, searchParams]);
  const d = await dic(lang);
  const seccion: Seccion | undefined =
    p.categoria === "encargos" ? "encargos" : p.categoria && VALIDAS.has(p.categoria) ? (p.categoria as Categoria) : undefined;
  const encargo = p.encargo === "1";

  // Sin seccion elegida: un indice de cards, una por categoria (mas Encargos,
  // si hay alguna obra taggeada), con las obras de cada una pasando detras del
  // titulo. Santiago prefirio esto a entrar directo a una grilla mezclada — la
  // categoria se elige antes de ver las obras, no despues con un filtro
  // encima de todo.
  if (!seccion) {
    const c = await conteos();
    const conObras = CATEGORIAS.filter((cat) => c[cat] > 0);
    const [porCategoria, obrasEncargos] = await Promise.all([
      Promise.all(conObras.map((cat) => obras({ categoria: cat, limite: 6 }))),
      c.encargos > 0 ? obras({ encargo: true, limite: 6 }) : Promise.resolve([]),
    ]);

    return (
      <main className="mx-auto max-w-[1600px] px-5 md:px-10">
        <header className="pt-14 pb-10 md:pt-20">
          <h1 className="display">{d.obras.titulo}</h1>
        </header>

        <section className="grid grid-cols-1 gap-x-6 gap-y-14 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {conObras.map((cat, i) => (
            <CategoriaCard
              key={cat}
              categoria={cat}
              etiqueta={d.obras.categorias[cat]}
              cuenta={c[cat]}
              obras={porCategoria[i]}
              lang={lang}
            />
          ))}
          {c.encargos > 0 && (
            <CategoriaCard
              categoria="encargos"
              etiqueta={d.obras.categorias.encargos}
              cuenta={c.encargos}
              obras={obrasEncargos}
              lang={lang}
            />
          )}
        </section>
      </main>
    );
  }

  const esEncargos = seccion === "encargos";
  const lista = await obras(esEncargos ? { encargo: true } : { categoria: seccion, encargo });

  return (
    <main className="mx-auto max-w-[1600px] px-5 md:px-10">
      <header className="flex flex-col gap-8 pt-14 pb-10 md:pt-20">
        <h1 className="display">{d.obras.categorias[seccion]}</h1>
        {esEncargos ? (
          <Link
            href={ruta(lang, "/galeria")}
            className="etiqueta text-tinta-media transition-colors hover:text-tinta"
          >
            ‹ {d.obras.todo}
          </Link>
        ) : (
          <Filtros lang={lang} categoria={seccion} encargo={encargo} d={d.obras} />
        )}
      </header>

      {lista.length === 0 ? (
        <p className="py-24 text-tinta-media">{d.obras.vacio}</p>
      ) : (
        <section className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((o, i) => (
            <ObraCard
              key={o.id}
              obra={o}
              lang={lang}
              prioridad={i < 4}
              sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            />
          ))}
        </section>
      )}

      <p className="etiqueta mt-16 text-tinta-suave">{fmt(lista.length === 1 ? d.obras.cuentaUna : d.obras.cuentaVarias, { n: lista.length })}</p>
    </main>
  );
}
