import { exigirAdmin } from "@/lib/admin/sesion";
import { seriesAdmin } from "@/lib/admin/datos";
import { AdminSeries } from "@/components/admin/AdminSeries";

export const dynamic = "force-dynamic";

export default async function Series() {
  await exigirAdmin();
  const series = await seriesAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Series</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        Ejes temáticos que agrupan obras. Las obras no se ven obligadas a una serie: la serie es opcional.
      </p>
      <div className="mt-6">
        <AdminSeries series={series} />
      </div>
    </main>
  );
}
