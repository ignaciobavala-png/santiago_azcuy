import Link from "next/link";

/** Marcador de seccion: la estructura y la nav ya existen, falta cargar. */
export function EnConstruccion({
  titulo,
  nota,
}: {
  titulo: string;
  nota: string;
}) {
  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-32 md:px-10 md:pt-20">
      <h1 className="display">{titulo}</h1>
      <p className="mt-10 max-w-md text-tinta-media">{nota}</p>
      <Link href="/obras" className="etiqueta mt-8 inline-block underline-offset-8 hover:underline">
        Mientras tanto, ver las obras →
      </Link>
    </main>
  );
}
