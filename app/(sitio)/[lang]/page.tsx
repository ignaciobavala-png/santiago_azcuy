import Link from "next/link";
import { CarruselObras } from "@/components/CarruselObras";
import { obras, conteos, texto } from "@/lib/consultas";
import { fmt, ruta, type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";

export const revalidate = 3600;

/**
 * La home es una portada, no un indice. Muestra el nombre y una sola obra
 * pasando en el carrusel central: el resto del trabajo se ve entrando a
 * Galeria, adonde llevan el enlace y el menu. Antes habia grillas de obras y
 * bloques de musica, libro y arquitectura; esos ya viven en el navbar, asi que
 * repetirlos aca solo le quitaba peso a lo plastico.
 */
export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = await dic(lang);

  const [lista, elegidas, c, statement] = await Promise.all([
    obras({ limite: 17 }),
    obras({ enCarrusel: true, limite: 6 }),
    conteos(),
    texto("statement", lang),
  ]);

  // Las obras marcadas "en el carrusel" mandan el carrusel; hasta que
  // Santiago elija alguna desde el panel, arranca con las primeras del orden
  // general. Asi la home nunca queda vacia por una decision que todavia no
  // se tomo.
  const carrusel = elegidas.length >= 2 ? elegidas : lista.slice(0, 5);

  return (
    <main className="mx-auto max-w-[1600px] px-5 md:px-10">
      <section className="grid gap-10 pt-14 pb-16 md:grid-cols-12 md:pt-24 md:pb-20">
        {/* El nombre en letras se fue al navbar; aca queda la firma, fija. El
            texto sigue en el h1 para lectores de pantalla y buscadores: la
            firma es una mascara, no dice nada. */}
        <h1 className="md:col-span-8">
          <span className="sr-only">Santiago Azcuy</span>
          <span className="firma block w-full max-w-[27rem] text-tinta" aria-hidden />
        </h1>
        <div className="flex flex-col justify-end gap-5 md:col-span-4">
          <p className="max-w-sm text-balance text-[1.0625rem] leading-relaxed text-tinta-media">
            {statement || d.home.statement}
          </p>
          <Link href={ruta(lang, "/galeria")} className="etiqueta underline-offset-8 hover:underline">
            {fmt(d.home.verObras, { n: c.total })}
          </Link>
        </div>
      </section>

      <CarruselObras obras={carrusel} lang={lang} />
    </main>
  );
}
