"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";

const CATEGORIAS = ["figurativo", "abstracto", "dibujo", "encargos"] as const;

export async function guardarMarket(datos: { emails_aviso: string; instrucciones_pago: string; porcentajes_senia: Record<string, number> }) {
  await exigirAdmin();
  const emails = datos.emails_aviso.trim();
  const lista = emails.split(/[;,\s]+/).filter(Boolean);
  if (lista.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error("Revisá los emails de aviso.");
  const porcentajes: Record<string, number> = {};
  for (const categoria of CATEGORIAS) {
    const valor = Number(datos.porcentajes_senia[categoria]);
    if (!Number.isFinite(valor) || valor < 0 || valor > 100) throw new Error(`La seña de ${categoria} debe estar entre 0 y 100%.`);
    porcentajes[categoria] = valor;
  }
  const { error } = await admin().from("market_config").upsert({ id: true, emails_aviso: emails, instrucciones_pago: datos.instrucciones_pago.trim().slice(0, 4000), porcentajes_senia: porcentajes });
  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);
  invalidarSitio();
}

export async function cambiarEstadoPedido(id: string, estado: string) {
  await exigirAdmin();
  const validos = ["nuevo", "contactado", "esperando_senia", "reservado", "pagado", "cerrado", "cancelado"];
  if (!/^[0-9a-f-]{36}$/i.test(id) || !validos.includes(estado)) throw new Error("Estado de pedido no válido.");
  const { error } = await admin().rpc("cambiar_estado_market_pedido", { p_pedido: id, p_estado: estado });
  if (error) throw new Error(`No se pudo actualizar el pedido: ${error.message}`);
  invalidarSitio();
}
