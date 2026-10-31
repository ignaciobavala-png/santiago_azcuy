"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { enviarMail } from "@/lib/market-email";
import { dinero, limpiarDatos, validarDatos, type DatosPago } from "@/lib/market-pagos";

const CATEGORIAS = ["figurativo", "abstracto", "dibujo", "encargos"] as const;

export async function guardarMarket(datos: {
  emails_aviso: string;
  instrucciones_pago: string;
  porcentajes_senia: Record<string, number>;
  datos_nacional: DatosPago;
  datos_internacional: DatosPago;
  mail_pago_confirmado: boolean;
}) {
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
  const nacional = limpiarDatos("nacional", datos.datos_nacional);
  const internacional = limpiarDatos("internacional", datos.datos_internacional);
  const errorDatos = validarDatos("nacional", nacional) ?? validarDatos("internacional", internacional);
  if (errorDatos) throw new Error(errorDatos);
  const { error } = await admin().from("market_config").upsert({
    id: true,
    emails_aviso: emails,
    instrucciones_pago: datos.instrucciones_pago.trim().slice(0, 4000),
    porcentajes_senia: porcentajes,
    datos_nacional: nacional,
    datos_internacional: internacional,
    mail_pago_confirmado: datos.mail_pago_confirmado === true,
  });
  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);
  invalidarSitio();
}

export type ResultadoEstado = { mail: "no_corresponde" | "enviado" | "sin_email" | "ya_enviado" | "error"; detalle?: string };

export async function cambiarEstadoPedido(id: string, estado: string): Promise<ResultadoEstado> {
  await exigirAdmin();
  const validos = ["nuevo", "contactado", "esperando_senia", "reservado", "pagado", "cerrado", "cancelado"];
  if (!/^[0-9a-f-]{36}$/i.test(id) || !validos.includes(estado)) throw new Error("Estado de pedido no válido.");
  const db = admin();
  const { error } = await db.rpc("cambiar_estado_market_pedido", { p_pedido: id, p_estado: estado });
  if (error) throw new Error(`No se pudo actualizar el pedido: ${error.message}`);
  invalidarSitio();
  if (estado !== "reservado" && estado !== "pagado") return { mail: "no_corresponde" };
  return avisarPagoConfirmado(id, estado);
}

/**
 * Mail al comprador cuando Santiago confirma el pago: "reservado" = llegó la
 * seña, "pagado" = pago completo. El estado ya cambió; si el mail falla (por
 * ejemplo Resend sin conectar) no se deshace nada, se le avisa a quien opera.
 */
async function avisarPagoConfirmado(id: string, estado: "reservado" | "pagado"): Promise<ResultadoEstado> {
  const db = admin();
  const [{ data: config }, { data: p }] = await Promise.all([
    db.from("market_config").select("mail_pago_confirmado,datos_nacional,datos_internacional").eq("id", true).single(),
    db.from("market_pedidos").select("codigo,nombre,email,moneda,total,senia_total,region,idioma,mail_estado_enviado").eq("id", id).single(),
  ]);
  if (!config?.mail_pago_confirmado || !p) return { mail: "no_corresponde" };
  if (!p.email) return { mail: "sin_email", detalle: "El pedido no tiene email: avisale por teléfono." };
  if (p.mail_estado_enviado === estado) return { mail: "ya_enviado" };
  const { data: items } = await db.from("market_pedido_items").select("titulo").eq("pedido_id", id);
  const en = p.idioma === "en";
  const obras = (items ?? []).map((i) => `• ${i.titulo}`).join("\n");
  const monto = estado === "pagado" ? p.total : p.senia_total;
  const importe = Number(monto) > 0 ? dinero(Number(monto), p.moneda, en ? "en" : "es") : null;
  const texto = estado === "pagado"
    ? (en
      ? [`Hi ${p.nombre},`, "", `We confirmed your payment for order ${p.codigo}${importe ? ` (${importe})` : ""}. Thank you!`, "", obras, "", "Santiago will contact you to arrange the shipping."]
      : [`Hola ${p.nombre},`, "", `Confirmamos tu pago del pedido ${p.codigo}${importe ? ` (${importe})` : ""}. ¡Gracias!`, "", obras, "", "Santiago se va a comunicar para coordinar el envío."])
    : (en
      ? [`Hi ${p.nombre},`, "", `We received your deposit for order ${p.codigo}${importe ? ` (${importe})` : ""}. The artwork is now reserved for you.`, "", obras, "", "Santiago will contact you about the remaining balance and the shipping."]
      : [`Hola ${p.nombre},`, "", `Recibimos tu seña del pedido ${p.codigo}${importe ? ` (${importe})` : ""}. La obra ya está reservada para vos.`, "", obras, "", "Santiago se va a comunicar para coordinar el saldo y el envío."]);
  try {
    await enviarMail({ to: [p.email], asunto: en ? `Payment confirmed — ${p.codigo}` : `Pago confirmado — ${p.codigo}`, texto: texto.join("\n") });
  } catch (e) {
    return { mail: "error", detalle: e instanceof Error ? e.message : "No se pudo enviar el mail." };
  }
  await db.from("market_pedidos").update({ mail_estado_enviado: estado }).eq("id", id);
  return { mail: "enviado" };
}

