import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/admin/sesion";
import { pistaAdmin } from "@/lib/admin/datos";
import { EditarPista } from "@/components/admin/EditarPista";
import { TIPOS_LABEL } from "@/components/admin/AdminMusica";

export const dynamic = "force-dynamic";

export default async function PistaFicha({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  const pista = await pistaAdmin(id);
  if (!pista) notFound();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <nav className="mb-4">
        <Link href="/admin/musica" className="etiqueta text-tinta-suave hover:text-tinta">
          ← Música
        </Link>
      </nav>
      <h1 className="titular">{pista.titulo}</h1>
      <p className="etiqueta mt-2 text-tinta-suave">
        {TIPOS_LABEL[pista.tipo]} · {pista.visible ? "visible" : "oculta"}
      </p>
      <EditarPista pista={pista} />
    </main>
  );
}
