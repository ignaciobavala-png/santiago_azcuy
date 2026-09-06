import { exigirAdmin } from "@/lib/admin/sesion";
import { capitulosAdmin, leadsAdmin } from "@/lib/admin/datos";
import { Capitulos } from "@/components/admin/Capitulos";

export const dynamic = "force-dynamic";

export default async function Libro() {
  await exigirAdmin();
  const [leads, capitulos] = await Promise.all([leadsAdmin(), capitulosAdmin()]);

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">El Aprendiz</h1>

      <section className="mt-8 max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="titular text-lg">Mails capturados</h2>
            <p className="etiqueta mt-1 text-tinta-suave">{leads.length} direcciones</p>
          </div>
          {/* Es una descarga de archivo, no una navegacion interna: el anchor
              pelado es el elemento correcto (Link prefetchearia el CSV). */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/admin/libro/export"
            className="etiqueta border border-linea px-4 py-2 hover:border-tinta-media"
          >
            Exportar CSV ↓
          </a>
        </header>

        {leads.length === 0 ? (
          <p className="py-8 text-tinta-media">Todavía no se capturó ningún mail.</p>
        ) : (
          <div className="mt-4 max-h-96 overflow-y-auto border border-linea">
            {leads.map((l) => (
              <div key={l.email} className="flex items-baseline justify-between gap-4 border-b border-linea px-3 py-2 text-sm last:border-0">
                <span className="truncate">{l.email}</span>
                <span className="shrink-0 text-xs text-tinta-suave">
                  {new Date(l.creado_at).toLocaleDateString("es-AR")} ·{" "}
                  {new Date(l.creado_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14 max-w-4xl">
        <h2 className="titular text-lg">Capítulos</h2>
        <p className="mt-1 max-w-prose text-sm text-tinta-media">
          Se editan el número (dejalo vacío en el prólogo) y el título. El texto de la novela se carga con el script.
        </p>
        <div className="mt-4">
          <Capitulos capitulos={capitulos} />
        </div>
      </section>
    </main>
  );
}
