import { exigirAdmin } from "@/lib/admin/sesion";
import { consultasAdmin } from "@/lib/admin/datos";
import { BandejaConsultas } from "@/components/admin/BandejaConsultas";

export const dynamic = "force-dynamic";

export default async function Consultas() {
  await exigirAdmin();
  const consultas = await consultasAdmin();
  const sinLeer = consultas.filter((c) => !c.leida).length;

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Consultas</h1>
      <p className="etiqueta mt-2 text-tinta-suave">
        {consultas.length} totales · {sinLeer} sin leer
      </p>
      <BandejaConsultas consultas={consultas} />
    </main>
  );
}
