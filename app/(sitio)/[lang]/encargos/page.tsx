import type { Metadata } from "next";
import { FormularioEncargo } from "@/components/FormularioEncargo";
import { type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const d = await dic((await params).lang);
  return { title: d.encargos.titulo, description: d.encargos.intro };
}

/**
 * Proyectos por encargo. La columna izquierda explica el encuadre (que se
 * recibe, como se evalua) y la derecha tiene el formulario: quien llega de un
 * enlace directo entiende el proceso sin tener que buscar.
 *
 * El lado a lado recien arranca en `lg`: en tablet la columna del titulo queda
 * demasiado angosta y la palabra mas larga ("Proyectos") desbordaba sobre las
 * casillas del formulario. Apilado, en cambio, hay ancho de sobra para los dos.
 * Y el titulo usa `.display-col` en vez de `.display`, que esta calibrado para
 * el ancho completo de la home.
 */
export default async function Encargos({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = await dic(lang);

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-24 md:px-10 md:pt-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <header className="lg:col-span-5">
          <h1 className="display-col">{d.encargos.titulo}</h1>
          <p className="mt-8 max-w-md leading-relaxed text-tinta-media">{d.encargos.intro}</p>
          <p className="mt-4 max-w-md leading-relaxed text-tinta-media">{d.encargos.evaluacion}</p>

          <p className="etiqueta mt-10 text-tinta-suave">{d.encargos.recibeTitulo}</p>
          <p className="mt-3 max-w-md leading-relaxed">{d.encargos.recibe}</p>

          <p className="mt-10 text-sm text-tinta-suave">{d.encargos.obligatorio}</p>
        </header>

        <div className="lg:col-span-6 lg:col-start-7">
          <FormularioEncargo lang={lang} d={d.encargos} />
        </div>
      </div>

      <p className="mt-16 max-w-3xl border-t border-linea pt-8 text-sm leading-relaxed text-tinta-media">
        {d.encargos.cierre}
      </p>
    </main>
  );
}
