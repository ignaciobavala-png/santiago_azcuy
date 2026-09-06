import { exigirAdmin } from "@/lib/admin/sesion";
import { textosAdmin } from "@/lib/admin/datos";
import { AdminTextos } from "@/components/admin/AdminTextos";

export const dynamic = "force-dynamic";

export default async function Textos() {
  await exigirAdmin();
  const textos = await textosAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Textos</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Cada bloque tiene su versión en castellano e inglés. Lo que se publica sale en vivo sin esperar la hora de caché.
      </p>
      <AdminTextos textos={textos} />
    </main>
  );
}
