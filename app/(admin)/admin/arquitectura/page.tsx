import { exigirAdmin } from "@/lib/admin/sesion";
import { proyectosAdmin } from "@/lib/admin/datos";
import { ListaProyectos, NuevoProyecto } from "@/components/admin/Proyectos";

export const dynamic = "force-dynamic";

export default async function Arquitectura() {
  await exigirAdmin();
  const proyectos = await proyectosAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Arquitectura</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Proyectos con sus láminas. El alta queda sin publicar hasta que tenga al menos una lámina: la home muestra la …/01 como portada.
      </p>

      <section className="mt-8">
        <h2 className="titular text-lg">Nuevo proyecto</h2>
        <div className="mt-3">
          <NuevoProyecto />
        </div>
      </section>

      <section className="mt-12">
        <ListaProyectos proyectos={proyectos} />
      </section>
    </main>
  );
}
