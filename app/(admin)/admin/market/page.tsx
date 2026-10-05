import { exigirAdmin } from "@/lib/admin/sesion";
import { marketConfigAdmin, pedidosMarketAdmin } from "@/lib/admin/datos";
import { MarketAdmin } from "@/components/admin/MarketAdmin";

export const dynamic = "force-dynamic";

export default async function Market() {
  await exigirAdmin();
  const [config, pedidos] = await Promise.all([marketConfigAdmin(), pedidosMarketAdmin()]);
  return <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8"><h1 className="titular">Market</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-tinta-media">Administrá avisos, porcentajes de seña y solicitudes. Las solicitudes no reservan una obra automáticamente: confirmá la seña antes de cambiarla a Reservado.</p><MarketAdmin config={config} pedidos={pedidos} /></main>;
}
