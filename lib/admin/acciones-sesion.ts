"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { valorCookie } from "./sesion";

/**
 * Limite de intentos por IP en memoria. En serverless el contador se reinicia
 * con cada instancia, asi que la defensa que de verdad sostiene es el retardo
 * fijo de 500 ms por intento fallido: hace inviable barrer claves aunque el
 * contador no exista. El contador solo evita que una sola IP martillee.
 */
const intentos = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 8;
const VENTANA_MS = 60_000;

async function ipActual(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mismaClave = (a: string, b: string) => {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function iniciarSesion(fd: FormData) {
  const ip = await ipActual();
  const ahora = Date.now();
  const estado = intentos.get(ip);

  if (estado && estado.hasta > ahora) {
    redirect("/admin?bloqueo=1");
  }

  const clave = String(fd.get("clave") ?? "");
  const esperada = process.env.ADMIN_PASSWORD ?? "";
  const correcta = esperada.length > 0 && mismaClave(clave, esperada);

  if (!correcta) {
    const n = (estado?.n ?? 0) + 1;
    intentos.set(ip, { n, hasta: n >= MAX_INTENTOS ? ahora + VENTANA_MS : 0 });
    await dormir(500);
    redirect(n >= MAX_INTENTOS ? "/admin?bloqueo=1" : "/admin?fallo=1");
  }

  intentos.delete(ip);
  (await cookies()).set("sa_admin", valorCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  redirect("/admin");
}

export async function cerrarSesion() {
  (await cookies()).delete("sa_admin");
  redirect("/admin");
}
