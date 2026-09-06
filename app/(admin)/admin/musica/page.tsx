import { exigirAdmin } from "@/lib/admin/sesion";
import { musicaAdmin } from "@/lib/admin/datos";
import { AdminMusica } from "@/components/admin/AdminMusica";

export const dynamic = "force-dynamic";

export default async function Musica() {
  await exigirAdmin();
  const pistas = await musicaAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Música</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Pegando la URL alcanza: el server resuelve título y verifica qué miniatura existe. La duración se completa a mano.
      </p>
      <AdminMusica pistas={pistas} />
    </main>
  );
}
