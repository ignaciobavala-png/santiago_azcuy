import { NextResponse } from "next/server";
import { admin } from "@/lib/admin/cliente";
import { enviarAvisoMarket, enviarMail } from "@/lib/market-email";
import { esRegion, limpiarDatos, lineasPago, dinero as din } from "@/lib/market-pagos";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const texto = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
const dinero = (n: number, moneda: string) => new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(n);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  if (texto(body.website, 100)) return NextResponse.json({ ok: true });
  const nombre = texto(body.nombre, 120);
  const telefono = texto(body.telefono, 40);
  const email = texto(body.email, 160).toLowerCase();
  const ids: string[] = Array.isArray(body.obras) ? [...new Set<string>(body.obras.filter((id: unknown): id is string => typeof id === "string" && UUID.test(id)))].slice(0, 12) : [];
  if (!nombre || !telefono || !ids.length || (Array.isArray(body.obras) && ids.length !== body.obras.length)) return NextResponse.json({ error: "Revisá el nombre, el teléfono y las obras elegidas." }, { status: 400 });
  if (!Array.isArray(body.precios) || body.precios.length !== ids.length) return NextResponse.json({ error: "Actualizá el carrito antes de enviar la solicitud." }, { status: 400 });
  const preciosEsperados = new Map<string, { precio: number; moneda: string }>();
  for (const p of body.precios) {
    if (!p || typeof p !== "object" || Array.isArray(p) || typeof p.id !== "string" || !UUID.test(p.id) || typeof p.precio !== "number" || !Number.isFinite(p.precio) || typeof p.moneda !== "string") return NextResponse.json({ error: "Actualizá el carrito antes de enviar la solicitud." }, { status: 400 });
    preciosEsperados.set(p.id, { precio: p.precio, moneda: p.moneda });
  }
  if (preciosEsperados.size !== ids.length || ids.some((id: string) => !preciosEsperados.has(id))) return NextResponse.json({ error: "Actualizá el carrito antes de enviar la solicitud." }, { status: 400 });
  if (!esRegion(body.region)) return NextResponse.json({ error: "Elegí desde dónde vas a pagar." }, { status: 400 });
  const region = body.region;
  const lang = body.lang === "en" ? "en" : "es";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "El email no parece válido." }, { status: 400 });

  const db = admin();
  const [{ data: obras, error: obrasError }, { data: config, error: configError }] = await Promise.all([
    db.from("obras").select("id,slug,titulo,categoria,precio,moneda,pago_nacional,pago_internacional").in("id", ids).eq("publicada", true).eq("para_venta", true).eq("estado", "disponible"),
    db.from("market_config").select("emails_aviso,instrucciones_pago,porcentajes_senia,datos_nacional,datos_internacional").eq("id", true).single(),
  ]);
  if (obrasError || configError || !config) return NextResponse.json({ error: "No se pudo procesar la solicitud. Probá nuevamente más tarde." }, { status: 503 });
  if (!obras || obras.length !== ids.length || obras.some((o) => !o.precio || Number(o.precio) <= 0)) return NextResponse.json({ error: "Alguna obra dejó de estar disponible. Actualizá el carrito y probá de nuevo." }, { status: 409 });
  if (obras.some((o) => { const p = preciosEsperados.get(o.id); return !p || p.precio !== Number(o.precio) || p.moneda !== o.moneda; })) return NextResponse.json({ error: "Cambió el precio de una obra. Quitala del carrito y volvé a agregarla para ver el precio actualizado." }, { status: 409 });

  const datosPago = limpiarDatos(region, region === "nacional" ? config.datos_nacional : config.datos_internacional);
  if (!datosPago.activo) return NextResponse.json({ error: "Esta forma de pago no está disponible por el momento. Escribinos desde Contacto." }, { status: 409 });
  const sinOpcion = obras.filter((o) => !(region === "nacional" ? o.pago_nacional : o.pago_internacional));
  if (sinOpcion.length) return NextResponse.json({ error: `${sinOpcion.map((o) => o.titulo).join(", ")}: no se ofrece con pago ${region === "nacional" ? "nacional" : "internacional"}. Quitala del carrito o elegí otra forma de pago.` }, { status: 409 });

  const pct = config.porcentajes_senia as Record<string, number>;
  const porMoneda = new Map<string, number>();
  const filas = obras.map((o) => {
    const porcentaje = Number(pct[o.categoria] ?? 30);
    const montoSenia = Math.round(Number(o.precio) * porcentaje) / 100;
    porMoneda.set(o.moneda, (porMoneda.get(o.moneda) ?? 0) + Number(o.precio));
    return { obra_id: o.id, titulo: o.titulo, slug: o.slug, categoria: o.categoria, precio: Number(o.precio), moneda: o.moneda, porcentaje_senia: porcentaje, montoSenia };
  });
  const monedas = [...porMoneda.keys()];
  const moneda = monedas.length === 1 ? monedas[0] : "USD";
  const total = monedas.length === 1 ? (porMoneda.get(moneda) ?? 0) : 0;
  const seniaTotal = monedas.length === 1 ? filas.reduce((sum, f) => sum + f.montoSenia, 0) : 0;
  const { data: pedido, error: pedidoError } = await db.from("market_pedidos").insert({ nombre, email: email || null, telefono, ciudad: texto(body.ciudad, 120) || null, pais: texto(body.pais, 120) || null, mensaje: texto(body.mensaje, 2000) || null, origen: "carrito", region, idioma: lang, total, senia_total: seniaTotal, moneda }).select("id,codigo").single();
  if (pedidoError || !pedido) return NextResponse.json({ error: "No se pudo guardar el pedido. Probá nuevamente." }, { status: 503 });
  const { error: itemsError } = await db.from("market_pedido_items").insert(filas.map((f) => ({ pedido_id: pedido.id, obra_id: f.obra_id, titulo: f.titulo, slug: f.slug, categoria: f.categoria, precio: f.precio, moneda: f.moneda, porcentaje_senia: f.porcentaje_senia, importe_senia: f.montoSenia })));
  if (itemsError) {
    await db.from("market_pedidos").delete().eq("id", pedido.id);
    return NextResponse.json({ error: "No se pudo guardar el detalle del pedido. Probá nuevamente." }, { status: 503 });
  }

  const resumen = filas.map((f) => `• ${f.titulo} (${f.categoria}): ${dinero(f.precio, f.moneda)} · seña ${f.porcentaje_senia}% (${dinero(f.montoSenia, f.moneda)})`).join("\n");
  const textoEmail = [`Pedido ${pedido.codigo}`, `Pago: ${region === "nacional" ? "nacional (Argentina)" : "internacional"}`, `Nombre: ${nombre}`, `Teléfono: ${telefono}`, email ? `Email: ${email}` : "", texto(body.ciudad,120) ? `Ubicación: ${texto(body.ciudad,120)}, ${texto(body.pais,120)}` : "", "", resumen, "", monedas.length === 1 ? `Total: ${dinero(total, moneda)} · seña estimada: ${dinero(seniaTotal, moneda)}` : "El pedido combina monedas; coordinar el total.", "Envío a cotizar aparte.", texto(body.mensaje, 2000) ? `\nMensaje: ${texto(body.mensaje, 2000)}` : "", "\nLa obra sigue disponible hasta confirmar el pago de la seña.", config.instrucciones_pago ? `\nInstrucciones de pago configuradas:\n${config.instrucciones_pago}` : ""].filter(Boolean).join("\n");
  const unaMoneda = monedas.length === 1;
  const pago = { region, lineas: lineasPago(region, datosPago, lang), moneda, monto: unaMoneda ? seniaTotal : null, total: unaMoneda ? total : null };
  if (email) {
    const l = lang === "en";
    const detalle = pago.lineas.map((x) => `${x.etiqueta}: ${x.valor}`).join("\n");
    const cuerpo = [l ? `Thank you, ${nombre}. We received your request ${pedido.codigo}.` : `Gracias, ${nombre}. Recibimos tu solicitud ${pedido.codigo}.`, "", resumen, "", pago.monto != null ? `${l ? "Deposit to transfer" : "Seña a transferir"}: ${din(pago.monto, moneda, lang)}` : (l ? "The amounts are in different currencies; Santiago will confirm the total." : "Los montos están en monedas distintas; Santiago te confirma el total."), "", l ? "Bank details:" : "Datos para la transferencia:", detalle, "", l ? `Please include the code ${pedido.codigo} in the transfer reference and send us the receipt. The artwork is reserved once we confirm the deposit. Shipping is quoted separately.` : `Indicá el código ${pedido.codigo} en la referencia y enviá el comprobante respondiendo este mail. La obra queda reservada cuando confirmemos la seña. El envío se cotiza aparte.`].join("\n");
    try { await enviarMail({ to: [email], asunto: l ? `Your request ${pedido.codigo}` : `Tu solicitud ${pedido.codigo}`, texto: cuerpo }); }
    catch (e) { console.error("[market] no se pudo enviar el mail al comprador:", e); }
  }
  try { await enviarAvisoMarket({ config, asunto: `Nueva solicitud de compra ${pedido.codigo}`, texto: textoEmail, replyTo: email || undefined }); }
  catch (e) { console.error("[market] no se pudo enviar el aviso:", e); return NextResponse.json({ ok: true, codigo: pedido.codigo, pago, aviso: "La solicitud quedó guardada, pero el aviso por email no se pudo enviar." }); }
  return NextResponse.json({ ok: true, codigo: pedido.codigo, pago });
}
