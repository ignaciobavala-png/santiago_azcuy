"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cambiarEstadoPedido, guardarMarket } from "@/lib/admin/acciones-market";
import type { MarketConfig, PedidoMarket } from "@/lib/admin/datos";
import { CAMPOS, REGIONES, type DatosPago, type Region } from "@/lib/market-pagos";

const CATS = ["figurativo", "abstracto", "dibujo", "encargos"] as const;
const LABEL: Record<string, string> = { figurativo: "Figurativo", abstracto: "Abstracto", dibujo: "Dibujo", encargos: "Encargos" };
const ESTADOS: Record<string, string> = { nuevo: "Nuevo", contactado: "Contactado", esperando_senia: "Esperando seña", reservado: "Reservado", pagado: "Pagado", cerrado: "Cerrado", cancelado: "Cancelado" };
const money = (v: number, moneda: string) => new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(Number(v));

export function MarketAdmin({ config, pedidos }: { config: MarketConfig; pedidos: PedidoMarket[] }) {
  const router = useRouter();
  const [emails, setEmails] = useState(config.emails_aviso);
  const [instrucciones, setInstrucciones] = useState(config.instrucciones_pago);
  const [pct, setPct] = useState<Record<string, string>>(Object.fromEntries(CATS.map((c) => [c, String(config.porcentajes_senia?.[c] ?? 30)])));
  const [datos, setDatos] = useState<Record<Region, DatosPago>>({ nacional: config.datos_nacional, internacional: config.datos_internacional });
  const [mailConfirmado, setMailConfirmado] = useState(config.mail_pago_confirmado);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  async function guardar(e: React.FormEvent) {
    e.preventDefault(); setGuardando(true); setAviso("");
    try { await guardarMarket({ emails_aviso: emails, instrucciones_pago: instrucciones, porcentajes_senia: Object.fromEntries(CATS.map((c) => [c, Number(pct[c])])), datos_nacional: datos.nacional, datos_internacional: datos.internacional, mail_pago_confirmado: mailConfirmado }); setAviso("Configuración guardada."); router.refresh(); }
    catch (err) { setAviso(err instanceof Error ? err.message : "No se pudo guardar."); }
    finally { setGuardando(false); }
  }
  const setCampo = (r: Region, clave: string, valor: string | boolean) => setDatos((d) => ({ ...d, [r]: { ...d[r], [clave]: valor } }));
  async function estado(id: string, valor: string) { try { const r = await cambiarEstadoPedido(id, valor); setAviso(r.mail === "enviado" ? "Estado actualizado y mail de pago confirmado enviado al comprador." : r.mail === "error" ? `Estado actualizado, pero el mail al comprador no salió: ${r.detalle}` : r.mail === "sin_email" ? `Estado actualizado. ${r.detalle}` : "Estado actualizado."); router.refresh(); } catch (err) { setAviso(err instanceof Error ? err.message : "No se pudo actualizar."); } }
  return <div className="mt-8 grid gap-16 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
    <form onSubmit={guardar} className="grid content-start gap-6">
      <section className="border-t border-linea pt-5"><h2 className="titular text-2xl">Avisos por email</h2><p className="mt-2 text-sm text-tinta-media">Podés cargar uno o más destinatarios separados por coma.</p>
        <label className="mt-5 grid gap-2 text-sm">Emails que reciben las consultas<input type="text" value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="santiago@..., vos@..." className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
        <p className="mt-3 text-xs leading-relaxed text-tinta-suave">El envío requiere configurar RESEND_API_KEY y RESEND_FROM_EMAIL en el entorno del sitio.</p>
      </section>
      {REGIONES.map((r) => <section key={r} className="border-t border-linea pt-5">
        <div className="flex items-start justify-between gap-4"><div><h2 className="titular text-2xl">{r === "nacional" ? "Datos bancarios · Nacional" : "Datos bancarios · Internacional"}</h2><p className="mt-2 text-sm text-tinta-media">{r === "nacional" ? "Para compradores que pagan desde Argentina." : "Para compradores que pagan desde el exterior."} Se muestran al comprador recién después de enviar la solicitud.</p></div>
          <label className="flex shrink-0 items-center gap-2 text-sm"><input type="checkbox" checked={datos[r].activo} onChange={(e) => setCampo(r, "activo", e.target.checked)} className="h-4 w-4 accent-tinta" />Activo</label></div>
        <div className={`mt-5 grid gap-4 sm:grid-cols-2 ${datos[r].activo ? "" : "opacity-60"}`}>{CAMPOS[r].map((c) => <label key={c.clave} className={`grid gap-2 text-sm ${c.largo ? "sm:col-span-2" : ""}`}>{c.etiqueta}{c.largo
          ? <textarea rows={3} maxLength={1000} value={String(datos[r][c.clave] ?? "")} onChange={(e) => setCampo(r, c.clave, e.target.value)} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" />
          : <input type="text" maxLength={160} value={String(datos[r][c.clave] ?? "")} onChange={(e) => setCampo(r, c.clave, e.target.value)} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" />}</label>)}</div>
        {!datos[r].activo && <p className="mt-3 text-xs text-tinta-suave">Desactivado: los compradores no ven esta forma de pago.</p>}
      </section>)}
      <section className="border-t border-linea pt-5"><h2 className="titular text-2xl">Mail de pago confirmado</h2>
        <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" checked={mailConfirmado} onChange={(e) => setMailConfirmado(e.target.checked)} className="mt-0.5 h-4 w-4 accent-tinta" /><span>Avisar por mail al comprador cuando marco la seña como recibida (Reservado) o el pago completo (Pagado).</span></label>
        <p className="mt-3 text-xs leading-relaxed text-tinta-suave">Hoy no sale ningún mail hasta conectar Resend (RESEND_API_KEY y RESEND_FROM_EMAIL). Mientras tanto el estado igual se actualiza y el panel te avisa que el mail no salió.</p>
      </section>
      <section className="border-t border-linea pt-5"><h2 className="titular text-2xl">Seña por categoría</h2><p className="mt-2 text-sm text-tinta-media">El porcentaje queda guardado en cada solicitud junto al precio consultado.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{CATS.map((c) => <label key={c} className="grid gap-2 text-sm">{LABEL[c]}<span className="flex items-center gap-2"><input type="number" min="0" max="100" step="1" value={pct[c]} onChange={(e) => setPct({ ...pct, [c]: e.target.value })} onWheel={(e) => e.currentTarget.blur()} className="w-28 rounded border border-linea bg-papel px-3 py-2 outline-none focus:border-tinta-media" />%</span></label>)}</div>
      </section>
      <section className="border-t border-linea pt-5"><h2 className="titular text-2xl">Notas internas de cobro</h2><p className="mt-2 text-sm text-tinta-media">Se incluyen solo en el aviso que recibís vos; el comprador ve los datos bancarios de arriba.</p>
        <label className="mt-5 grid gap-2 text-sm">Alias, cuentas y aclaraciones<textarea rows={6} maxLength={4000} value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
      </section>
      {aviso && <p role="status" className="text-sm text-tinta-media">{aviso}</p>}
      <button disabled={guardando} className="etiqueta w-fit border border-tinta bg-tinta px-5 py-3 text-papel disabled:opacity-50">{guardando ? "Guardando…" : "Guardar configuración"}</button>
    </form>
    <section><div className="flex items-end justify-between border-b border-linea pb-4"><div><h2 className="titular text-2xl">Solicitudes</h2><p className="mt-2 etiqueta text-tinta-suave">Últimas {pedidos.length}</p></div></div>
      {!pedidos.length ? <p className="py-8 text-sm text-tinta-media">Todavía no llegaron solicitudes. Cuando alguien use el carrito o envíe un encargo va a aparecer acá.</p> : <div>{pedidos.map((p) => <article key={p.id} className="border-b border-linea py-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="etiqueta text-tinta-suave">{p.codigo} · {p.origen === "encargo" ? "Encargo" : "Carrito"}{p.region ? ` · Pago ${p.region}` : ""}</p><h3 className="mt-2 text-lg">{p.nombre}</h3><p className="mt-1 text-sm text-tinta-media">{p.telefono}{p.email ? ` · ${p.email}` : ""}{p.ciudad ? ` · ${p.ciudad}${p.pais ? `, ${p.pais}` : ""}` : ""}</p></div>
          <select aria-label={`Estado ${p.codigo}`} value={p.estado} onChange={(e) => estado(p.id, e.target.value)} className="rounded border border-linea bg-papel px-2 py-2 text-xs">{Object.entries(ESTADOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        {p.items.length > 0 && <ul className="mt-4 grid gap-2 text-sm">{p.items.map((i, n) => <li key={`${i.slug}-${n}`} className="flex justify-between gap-4"><span>{i.titulo}<span className="text-tinta-suave"> · {LABEL[i.categoria]} · seña {i.porcentaje_senia}% ({money(i.importe_senia, i.moneda)})</span></span><span className="whitespace-nowrap">{money(i.precio, i.moneda)}</span></li>)}</ul>}
        {p.total > 0 && <p className="mt-4 text-right text-sm">Total {money(p.total, p.moneda)}{p.senia_total > 0 ? ` · Seña ${money(p.senia_total, p.moneda)}` : ""}</p>}
        {p.mensaje && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-tinta-media">{p.mensaje}</p>}
        <p className="mt-3 text-xs text-tinta-suave">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(p.creado_at))}</p>
      </article>)}</div>}
    </section>
  </div>;
}
