import { exigirAdmin } from "@/lib/admin/sesion";
import { textosAdmin } from "@/lib/admin/datos";
import { AdminTextos } from "@/components/admin/AdminTextos";

export const dynamic = "force-dynamic";

export default async function Textos() {
  await exigirAdmin();
  const grupos = await textosAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Textos</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Todos los textos de la página, en el orden en que se leen. Cada uno tiene su versión en castellano e inglés, y lo que se guarda sale en vivo sin esperar la hora de caché. El texto gris dentro de un campo vacío es el que se está mostrando hoy: para volver a él, alcanza con borrar lo escrito y guardar.
      </p>
      <AdminTextos grupos={grupos} />
    </main>
  );
}
