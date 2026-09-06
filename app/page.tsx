import Link from "next/link";
import { ObraCard } from "@/components/ObraCard";
import { obras, conteos, texto } from "@/lib/consultas";

export const revalidate = 3600;

/**
 * La home es un indice editorial, no un menu. La jerarquia (pintura primero,
 * despues musica, libro y arquitectura) se expresa en el peso y la frecuencia
 * de cada bloque: cinco secciones iguales en una barra dirian "hago un poco de
 * todo" y diluirian lo que el trabajo tiene de central.
 */
export default async function Home() {
  const [lista, c, statement] = await Promise.all([
    obras({ limite: 13 }),
    conteos(),
    texto("statement"),
  ]);

  const [apertura, ...resto] = lista;

  return (
    <main className="mx-auto max-w-[1600px] px-5 md:px-10">
      <section className="grid gap-10 pt-14 pb-20 md:grid-cols-12 md:pt-24 md:pb-28">
        <h1 className="display md:col-span-8">
          Santiago
          <br />
          Azcuy
        </h1>
        <div className="flex flex-col justify-end gap-5 md:col-span-4">
          <p className="max-w-sm text-balance text-[1.0625rem] leading-relaxed text-tinta-media">
            {statement ||
              "Pintura, dibujo, música y arquitectura. Una obra atravesada por lo cósmico y lo místico."}
          </p>
          <Link href="/obras" className="etiqueta underline-offset-8 hover:underline">
            Ver las {c.total} obras →
          </Link>
        </div>
      </section>

      {apertura && (
        <section className="revelar mb-24">
          <ObraCard obra={apertura} sizes="100vw" prioridad />
        </section>
      )}

      <section className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {resto.slice(0, 6).map((o, i) => (
          <div key={o.id} className={`revelar ${i === 1 ? "lg:mt-20" : ""}`}>
            <ObraCard obra={o} />
          </div>
        ))}
      </section>

      <Interrupcion
        etiqueta="Música"
        titulo="Discos, videos y shows"
        texto="La obra sonora, embebida desde las plataformas donde ya vive."
        href="/musica"
      />

      <section className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {resto.slice(6).map((o) => (
          <div key={o.id} className="revelar">
            <ObraCard obra={o} />
          </div>
        ))}
      </section>

      <div className="grid gap-px bg-linea md:grid-cols-2">
        <Interrupcion
          etiqueta="El Aprendiz"
          titulo="La novela"
          texto="Ciudad Intradorada."
          href="/libro"
          compacta
        />
        <Interrupcion
          etiqueta="Arquitectura"
          titulo="Proyectos"
          texto="Templo circular en Chacarita, vivienda en Chapadmalal."
          href="/arquitectura"
          compacta
        />
      </div>
    </main>
  );
}

function Interrupcion({
  etiqueta,
  titulo,
  texto,
  href,
  compacta = false,
}: {
  etiqueta: string;
  titulo: string;
  texto: string;
  href: string;
  compacta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`revelar group block bg-papel ${
        compacta ? "px-6 py-14 md:px-10" : "my-24 border-y border-linea py-16 md:py-24"
      }`}
    >
      <p className="etiqueta text-tinta-suave">{etiqueta}</p>
      <h2 className="titular mt-3 max-w-3xl">{titulo}</h2>
      <p className="mt-4 max-w-md text-tinta-media">{texto}</p>
      <span className="etiqueta mt-6 inline-block underline-offset-8 group-hover:underline">
        Ver →
      </span>
    </Link>
  );
}
