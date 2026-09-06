import { notFound } from "next/navigation";
import Link from "next/link";
import { exigirAdmin } from "@/lib/admin/sesion";
import { obraAdmin, seriesAdmin } from "@/lib/admin/datos";
import { ObraFormulario } from "@/components/admin/ObraFormulario";
import { GestionImagen } from "@/components/admin/GestionImagen";

export const dynamic = "force-dynamic";

export default async function ObraFicha({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  const [obra, series] = await Promise.all([obraAdmin(id), seriesAdmin()]);
  if (!obra) notFound();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <nav className="mb-4">
        <Link href="/admin/obras" className="etiqueta text-tinta-suave hover:text-tinta">
          ← Obras
        </Link>
      </nav>

      <h1 className="titular">{obra.titulo}</h1>
      <p className="etiqueta mt-2 text-tinta-suave">
        {obra.slug} · {obra.imagen}
      </p>

      <ObraFormulario obra={obra} series={series} />

      <section className="mt-12">
        <h2 className="titular text-xl">Imagen y baja</h2>
        <div className="mt-5 max-w-4xl">
          <GestionImagen obraId={obra.id} imagen={obra.imagen} titulo={obra.titulo} />
        </div>
      </section>
    </main>
  );
}
