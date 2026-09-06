/**
 * Los valores llegan del FormData como strings, y en es-AR los decimales se
 * escriben con coma. Estos helpers normalizan a numeros o null y devuelven los
 * mensajes de error en castellano para mostrarlos en el formulario.
 */

export function numeroOpcional(crudo: FormDataEntryValue | null, campo: string): {
  valor: number | null;
  error?: string;
} {
  const s = String(crudo ?? "").trim().replace(",", ".");
  if (!s) return { valor: null };
  const n = Number(s);
  if (!Number.isFinite(n)) return { valor: null, error: `${campo} no es un numero valido.` };
  return { valor: n };
}

export function enteroOpcional(crudo: FormDataEntryValue | null, campo: string): {
  valor: number | null;
  error?: string;
} {
  const s = String(crudo ?? "").trim();
  if (!s) return { valor: null };
  const n = Number(s);
  if (!Number.isInteger(n)) return { valor: null, error: `${campo} tiene que ser un entero.` };
  return { valor: n };
}

export function textoOpcional(crudo: FormDataEntryValue | null): string | null {
  const s = String(crudo ?? "").trim();
  return s || null;
}

export const esSi = (crudo: FormDataEntryValue | null) =>
  crudo !== null && crudo !== undefined && String(crudo) !== "false" && String(crudo) !== "";
