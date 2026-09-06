import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/admin/sesion";
import { proyectoAdmin } from "@/lib/admin/datos";
import { FormProyecto } from "@/components/admin/Proyectos";
import { Laminas } from "@/components/admin/Laminas";

export const dynamic = "force-dynamic";

export default async function ProyectoFicha({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  const proyecto = await proyectoAdmin(id);
  if (!proyecto) notFound();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <nav className="mb-4">
        <Link href="/admin/arquitectura" className="etiqueta text-tinta-suave hover:text-tinta">
          ← Arquitectura
        </Link>
      </nav>
      <h1 className="titular">{proyecto.titulo}</h1>
      <p className="etiqueta mt-2 text-tinta-suave">
        {proyecto.publicado ? "publicado" : "sin publicar"} · {proyecto.laminas.length} láminas
      </p>

      <section className="mt-8">
        <h2 className="titular text-lg">Ficha</h2>
        <div className="mt-3">
          <FormProyecto proyecto={proyecto} />
        </div>
      </section>

      <Laminas proyectoId={proyecto.id} laminas={proyecto.laminas} />
    </main>
  );
}
