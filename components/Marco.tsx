import { t, type Lang } from "@/lib/i18n";

export { Cabecera } from "@/components/Cabecera";

export function Pie({ lang }: { lang: Lang }) {
  const d = t(lang);

  return (
    <footer className="mt-32 border-t border-linea">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <p className="titular max-w-xl whitespace-pre-line">{d.cierre.obra}</p>
        {/* La firma se fue al navbar, donde funciona como marca. Repetirla aca
            la devolvia a ser un adorno de cierre, que es lo que se queria
            evitar. */}
        <p className="etiqueta pb-1 text-tinta-suave">
          © {new Date().getFullYear()} Santiago Azcuy
        </p>
      </div>
    </footer>
  );
}
