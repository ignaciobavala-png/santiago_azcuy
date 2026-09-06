import { exigirAdmin } from "@/lib/admin/sesion";
import { seriesAdmin } from "@/lib/admin/datos";
import { ObraFormulario } from "@/components/admin/ObraFormulario";

export const dynamic = "force-dynamic";

export default async function ObraNueva() {
  await exigirAdmin();
  const series = await seriesAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Nueva obra</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Primero la imagen (se sube directo a Supabase), después la ficha. Si algo falla a mitad de camino no queda la obra a medias.
      </p>
      <ObraFormulario series={series} />
    </main>
  );
}
