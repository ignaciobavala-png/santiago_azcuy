import Link from "next/link";
import { ruta, type Lang } from "@/lib/i18n";

/** Marcador de seccion: la estructura y la nav ya existen, falta cargar. */
export function EnConstruccion({
  titulo,
  nota,
  mientras,
  lang,
}: {
  titulo: string;
  nota: string;
  mientras: string;
  lang: Lang;
}) {
  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-32 md:px-10 md:pt-20">
      <h1 className="display">{titulo}</h1>
      <p className="mt-10 max-w-md text-tinta-media">{nota}</p>
      <Link
        href={ruta(lang, "/obras")}
        className="etiqueta mt-8 inline-block underline-offset-8 hover:underline"
      >
        {mientras}
      </Link>
    </main>
  );
}
