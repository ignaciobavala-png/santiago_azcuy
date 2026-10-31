"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Obra } from "@/lib/tipos";
import type { Lang } from "@/lib/i18n";
import { ruta } from "@/lib/i18n";
import { url } from "@/lib/media";
import { dinero, type LineaPago, type Region } from "@/lib/market-pagos";

export type ItemCarrito = Pick<Obra, "id" | "slug" | "titulo" | "imagen" | "imagen_w" | "imagen_h" | "categoria" | "precio" | "moneda" | "pago_nacional" | "pago_internacional">;
type Contexto = { items: ItemCarrito[]; agregar: (obra: ItemCarrito) => void; quitar: (id: string) => void; vaciar: () => void };
const CarritoContext = createContext<Contexto | null>(null);
const STORAGE = "santi-art-carrito-v1";
const VACIO: ItemCarrito[] = [];
let snapshot: ItemCarrito[] = VACIO;
let inicializado = false;
const listeners = new Set<() => void>();

function leerCarrito() {
  if (!inicializado && typeof window !== "undefined") {
    inicializado = true;
    try {
      const dato: unknown = JSON.parse(localStorage.getItem(STORAGE) ?? "[]");
      snapshot = Array.isArray(dato) ? dato as ItemCarrito[] : VACIO;
    } catch { localStorage.removeItem(STORAGE); snapshot = VACIO; }
  }
  return snapshot;
}

function suscribir(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publicar(items: ItemCarrito[]) {
  snapshot = items;
  inicializado = true;
  if (typeof window !== "undefined") localStorage.setItem(STORAGE, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(suscribir, leerCarrito, () => VACIO);
  const agregar = (obra: ItemCarrito) => { const actual = leerCarrito(); if (!actual.some((i) => i.id === obra.id)) publicar([...actual, obra]); };
  const quitar = (id: string) => publicar(leerCarrito().filter((i) => i.id !== id));
  const vaciar = () => publicar(VACIO);
  const value = useMemo(() => ({ items, agregar, quitar, vaciar }), [items]);
  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const value = useContext(CarritoContext);
  if (!value) throw new Error("useCarrito necesita ProveedorCarrito");
  return value;
}

export function BotonCarrito({ obra, texto = "Agregar al carrito" }: { obra: Obra; texto?: string }) {
  const { items, agregar, quitar } = useCarrito();
  const enCarrito = items.some((i) => i.id === obra.id);
  const item: ItemCarrito = { id: obra.id, slug: obra.slug, titulo: obra.titulo, imagen: obra.imagen, imagen_w: obra.imagen_w, imagen_h: obra.imagen_h, categoria: obra.categoria, precio: obra.precio, moneda: obra.moneda, pago_nacional: obra.pago_nacional, pago_internacional: obra.pago_internacional };
  return <button type="button" onClick={() => enCarrito ? quitar(obra.id) : agregar(item)} className="etiqueta border border-luz/35 px-5 py-3 transition-colors hover:bg-luz hover:text-noche active:translate-y-px">{enCarrito ? "Quitar del carrito" : texto}</button>;
}

export function EnlaceCarrito({ lang, nav, className }: { lang: Lang; nav: string; className?: string }) {
  const { items } = useCarrito();
  return <Link href={ruta(lang, "/carrito")} className={className ?? "etiqueta flex items-center gap-1.5 whitespace-nowrap text-tinta-media transition-colors hover:text-tinta"} aria-label={`${nav}${items.length ? `, ${items.length}` : ""}`}>
    <svg viewBox="0 0 20 20" className="h-[0.9rem] w-[0.9rem]" aria-hidden><path d="M1.5 2h2l1.9 9.6a1.6 1.6 0 0 0 1.57 1.29h6.6a1.6 1.6 0 0 0 1.57-1.3L17 5.5H4.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="16.5" r="1.15" fill="currentColor"/><circle cx="14" cy="16.5" r="1.15" fill="currentColor"/></svg>
    {nav}{items.length > 0 && <span>({items.length})</span>}
  </Link>;
}

const fmt = (n: number, moneda: string, lang: Lang) => new Intl.NumberFormat(lang === "es" ? "es-AR" : "en-US", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(n);

type Pago = { region: Region; lineas: LineaPago[]; moneda: string; monto: number | null; total: number | null };
export type OpcionesPago = { nacional: boolean; internacional: boolean };
const TX = {
  es: { region: "¿Desde dónde vas a pagar?", nacional: "Argentina (transferencia)", internacional: "Exterior (transferencia internacional)", ninguna: "Por ahora no hay formas de pago habilitadas. Escribinos desde Contacto y lo resolvemos.", noObra: "no se ofrece con esta forma de pago", ok: "Gracias, recibimos tu solicitud.", senia: "Seña a transferir", datos: "Datos para la transferencia", ref: "Indicá el código del pedido en la referencia y enviá el comprobante a Santiago (por WhatsApp o respondiendo el mail). La obra queda reservada cuando confirme la seña. El envío se cotiza aparte.", mixtas: "Los montos están en monedas distintas; Santiago te confirma el total." },
  en: { region: "Where will you pay from?", nacional: "Argentina (bank transfer)", internacional: "Abroad (international transfer)", ninguna: "No payment options are available right now. Please write to us from Contact.", noObra: "is not offered with this payment option", ok: "Thank you, we received your request.", senia: "Deposit to transfer", datos: "Bank transfer details", ref: "Include the order code in the transfer reference and send the receipt to Santiago (WhatsApp or by replying to the email). The artwork is reserved once he confirms the deposit. Shipping is quoted separately.", mixtas: "Amounts are in different currencies; Santiago will confirm the total." },
} as const;

export function PaginaCarrito({ lang, opciones = { nacional: true, internacional: true } }: { lang: Lang; opciones?: OpcionesPago }) {
  const { items, quitar, vaciar } = useCarrito();
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState("");
  const [avisoEmail, setAvisoEmail] = useState(false);
  const [codigoPedido, setCodigoPedido] = useState("");
  const [pago, setPago] = useState<Pago | null>(null);
  const [region, setRegion] = useState<Region | "">(opciones.nacional && !opciones.internacional ? "nacional" : !opciones.nacional && opciones.internacional ? "internacional" : "");
  const tx = TX[lang];
  const sinOpcion = region ? items.filter((i) => !(region === "nacional" ? i.pago_nacional !== false : i.pago_internacional !== false)) : [];
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", ciudad: "", pais: "", mensaje: "" });
  const monedas = [...new Set(items.map((i) => i.moneda))];
  const totales = monedas.map((moneda) => ({ moneda, total: items.filter((i) => i.moneda === moneda).reduce((s, i) => s + Number(i.precio ?? 0), 0) }));
  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!region) return setError(tx.region);
    if (sinOpcion.length) return setError(`${sinOpcion.map((i) => i.titulo).join(", ")} ${tx.noObra}.`);
    setEstado("enviando");
    const website = ((e.currentTarget as HTMLFormElement).elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/market/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, region, website, obras: items.map((i) => i.id), precios: items.map((i) => ({ id: i.id, precio: i.precio, moneda: i.moneda })), lang }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar la solicitud.");
      setAvisoEmail(Boolean(data.aviso));
      setCodigoPedido(data.codigo ?? "");
      setPago(data.pago ?? null);
      setEstado("ok"); vaciar();
    } catch (e) { setEstado("idle"); setError(e instanceof Error ? e.message : "No se pudo enviar la solicitud."); }
  }
  if (estado === "ok") return <main className="mx-auto max-w-3xl px-5 py-20 md:px-10"><p className="etiqueta text-tinta-suave">Solicitud enviada{codigoPedido ? ` · ${codigoPedido}` : ""}</p><h1 className="titular mt-4">{tx.ok}</h1>{pago ? <section className="mt-8 border border-linea p-6">
      <p className="text-lg">{pago.monto != null ? <>{tx.senia}: <strong>{dinero(pago.monto, pago.moneda, lang)}</strong></> : tx.mixtas}</p>
      <h2 className="etiqueta mt-6 text-tinta-suave">{tx.datos}</h2>
      <dl className="mt-3 grid gap-2 text-sm">{pago.lineas.map((l) => <div key={l.etiqueta} className="grid gap-1 sm:grid-cols-[200px_1fr]"><dt className="text-tinta-suave">{l.etiqueta}</dt><dd className="whitespace-pre-wrap break-all select-all">{l.valor}</dd></div>)}</dl>
      <p className="mt-6 text-sm leading-relaxed text-tinta-media">{tx.ref}</p></section> : <p className="mt-5 leading-relaxed text-tinta-media">Santiago se va a contactar para confirmar disponibilidad, acordar la seña y cotizar el envío. La obra no queda reservada hasta que se confirme el pago de la seña.</p>}{avisoEmail && <p className="mt-4 text-sm text-amber-200">La solicitud quedó registrada, pero el aviso automático por email tuvo un problema. No hace falta enviarla de nuevo.</p>}<Link href={ruta(lang, "/galeria")} className="etiqueta mt-10 inline-block border border-linea px-5 py-3 hover:border-tinta-media">Volver a la galería</Link></main>;
  return <main className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
    <p className="etiqueta text-tinta-suave">Market · Solicitud de compra</p><h1 className="display mt-4">Tu selección</h1>
    {!items.length ? <div className="mt-12 border-t border-linea py-10"><p className="text-tinta-media">{lang === "es" ? "Tu carrito está vacío." : "Your cart is empty."}</p><Link href={ruta(lang, "/galeria")} className="etiqueta mt-6 inline-block underline underline-offset-4">{lang === "es" ? "Explorar la galería" : "Explore the gallery"}</Link></div> : <div className="mt-12 grid gap-14 border-t border-linea pt-8 lg:grid-cols-12">
      <section className="lg:col-span-7">{items.map((item) => <article key={item.id} className="grid grid-cols-[96px_1fr_auto] gap-4 border-b border-linea py-5 sm:grid-cols-[140px_1fr_auto]">
        <img src={url(item.imagen, "sm")} alt={item.titulo} className="aspect-square h-24 w-24 object-cover sm:h-32 sm:w-32" />
        <div><Link href={ruta(lang, `/galeria/${item.slug}`)} className="text-lg hover:underline">{item.titulo}</Link><p className="mt-2 text-sm text-tinta-media">{fmt(Number(item.precio), item.moneda, lang)} · {item.moneda}</p><button type="button" onClick={() => quitar(item.id)} className="etiqueta mt-4 text-tinta-suave underline underline-offset-4">Quitar</button></div>
        <p className="etiqueta text-tinta-suave">{item.categoria}</p>
      </article>)}
      {monedas.length > 1 && <p className="mt-5 text-sm text-tinta-media">Los precios están en monedas distintas; el total se coordina por separado.</p>}
      {totales.map((t) => <p key={t.moneda} className="mt-5 text-right text-lg">Subtotal {t.moneda}: {fmt(t.total, t.moneda, lang)}</p>)}
      <p className="mt-6 text-xs leading-relaxed text-tinta-suave">El envío se cotiza aparte. Esta solicitud no reserva la obra; la reserva comienza cuando Santiago confirma la recepción de la seña.</p></section>
      <form onSubmit={enviar} className="grid content-start gap-5 lg:col-span-5">
        <fieldset className="grid gap-2 text-sm"><legend className="titular mb-2 text-2xl">{tx.region}</legend>
          {!opciones.nacional && !opciones.internacional && <p className="text-tinta-media">{tx.ninguna}</p>}
          {(["nacional", "internacional"] as const).filter((r) => opciones[r]).map((r) => <label key={r} className="flex items-center gap-2"><input type="radio" name="region" required checked={region === r} onChange={() => setRegion(r)} className="h-4 w-4 accent-tinta" />{tx[r]}</label>)}
          {sinOpcion.length > 0 && <p role="alert" className="text-sm text-amber-200">{sinOpcion.map((i) => i.titulo).join(", ")} {tx.noObra}.</p>}
        </fieldset>
        <h2 className="titular text-2xl">¿Cómo te contactamos?</h2>
        <label className="grid gap-2 text-sm">Nombre y apellido *<input required maxLength={120} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
        <label className="grid gap-2 text-sm">Teléfono / WhatsApp *<input required maxLength={40} type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
        <label className="grid gap-2 text-sm">Email<input type="email" maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Ciudad<input maxLength={120} value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label><label className="grid gap-2 text-sm">País<input maxLength={120} value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label></div>
        <label className="grid gap-2 text-sm">Mensaje o consulta<textarea rows={3} maxLength={2000} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="rounded border border-linea bg-papel px-3 py-2.5 outline-none focus:border-tinta-media" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button disabled={estado === "enviando" || (!opciones.nacional && !opciones.internacional)} className="etiqueta w-fit border border-tinta bg-tinta px-6 py-3 text-papel transition-opacity hover:opacity-80 disabled:opacity-50">{estado === "enviando" ? "Enviando…" : "Enviar solicitud"}</button>
      </form>
    </div>}
  </main>;
}
