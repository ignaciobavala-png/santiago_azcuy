import { t, type Lang } from "@/lib/i18n";

export { Cabecera } from "@/components/Cabecera";

export function Pie({ lang }: { lang: Lang }) {
  const d = t(lang);

  return (
    <footer className="mt-32 border-t border-linea">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-10">
        <p className="titular max-w-xl whitespace-pre-line">{d.cierre.obra}</p>
        <div className="flex items-end gap-8">
          {/* El PNG original es blanco sobre transparente y desaparecia sobre
              el papel claro. Va como mascara CSS: toma currentColor, asi que
              se lee igual en tema claro, en oscuro y sobre el negro de la obra. */}
          <span
            className="firma h-16 w-16 text-tinta md:h-20 md:w-20"
            role="img"
            aria-label={d.cierre.firma}
          />
          <p className="etiqueta pb-1 text-tinta-suave">
            © {new Date().getFullYear()} Santiago Azcuy
          </p>
        </div>
      </div>
    </footer>
  );
}
