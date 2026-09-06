import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sesion del panel. La cookie no es un "admin=1" pelado que se escribe desde la
 * consola: es `<vencimiento>.<hmac>`, con el HMAC-SHA256 del vencimiento
 * firmado con ADMIN_SECRET. Sin la clave no se puede forjar, y al vencer se
 * cae sola aunque la firma siga valida.
 *
 * Las Server Actions parecen funciones pero son endpoints HTTP publicos: se
 * las puede invocar sin haber pasado nunca por el login. Por eso `exigirAdmin`
 * va como primera linea de cada action y de cada page del panel.
 */
const NOMBRE = "sa_admin";
const DIAS_MS = 30 * 24 * 60 * 60 * 1000;

function secreto(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("Falta ADMIN_SECRET en el entorno");
  return s;
}

export function firmar(vencimiento: number): string {
  return createHmac("sha256", secreto()).update(String(vencimiento)).digest("hex");
}

/** Valor de cookie nuevo: vence en 30 dias. */
export function valorCookie(): string {
  const vencimiento = Date.now() + DIAS_MS;
  return `${vencimiento}.${firmar(vencimiento)}`;
}

export function validaValor(valor: string | undefined): boolean {
  if (!valor) return false;
  const punto = valor.indexOf(".");
  if (punto <= 0) return false;
  const vencimiento = valor.slice(0, punto);
  const hmac = valor.slice(punto + 1);
  if (!/^\d+$/.test(vencimiento)) return false;
  if (Number(vencimiento) < Date.now()) return false;

  const esperado = Buffer.from(firmar(Number(vencimiento)), "utf8");
  const dado = Buffer.from(hmac, "utf8");
  if (esperado.length !== dado.length) return false;
  return timingSafeEqual(esperado, dado);
}

export async function tieneSesion(): Promise<boolean> {
  const cookie = (await cookies()).get(NOMBRE);
  return validaValor(cookie?.value);
}

/**
 * Corta en seco si la cookie no valida: redirige al login. Dentro de una
 * Server Action el redirect aborta la accion antes de tocar la base; dentro de
 * una page lleva a la pantalla de login. No hay camino que siga de largo.
 */
export async function exigirAdmin(): Promise<void> {
  if (!(await tieneSesion())) redirect("/admin");
}
