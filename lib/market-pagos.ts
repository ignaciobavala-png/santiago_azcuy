/**
 * Datos bancarios del market y opciones de pago.
 *
 * Los datos viven en market_config (sin acceso anon) y se entregan solo despues
 * de crear un pedido. Este modulo no importa nada del servidor: lo usan tanto
 * el panel como la API y la pantalla del carrito.
 */
export type Region = "nacional" | "internacional";
export const REGIONES: Region[] = ["nacional", "internacional"];
export const esRegion = (v: unknown): v is Region => v === "nacional" || v === "internacional";

export const CAMPOS: Record<Region, { clave: string; etiqueta: string; etiquetaEn: string; largo?: boolean }[]> = {
  nacional: [
    { clave: "titular", etiqueta: "Titular", etiquetaEn: "Account holder" },
    { clave: "banco", etiqueta: "Banco", etiquetaEn: "Bank" },
    { clave: "tipo_cuenta", etiqueta: "Tipo de cuenta", etiquetaEn: "Account type" },
    { clave: "cbu", etiqueta: "CBU / CVU", etiquetaEn: "CBU / CVU" },
    { clave: "alias", etiqueta: "Alias", etiquetaEn: "Alias" },
    { clave: "cuit", etiqueta: "CUIT / CUIL", etiquetaEn: "CUIT / CUIL" },
    { clave: "notas", etiqueta: "Aclaraciones", etiquetaEn: "Notes", largo: true },
  ],
  internacional: [
    { clave: "titular", etiqueta: "Titular", etiquetaEn: "Account holder" },
    { clave: "banco", etiqueta: "Banco", etiquetaEn: "Bank" },
    { clave: "iban", etiqueta: "IBAN / número de cuenta", etiquetaEn: "IBAN / account number" },
    { clave: "swift", etiqueta: "SWIFT / BIC", etiquetaEn: "SWIFT / BIC" },
    { clave: "routing", etiqueta: "Routing / ABA (si aplica)", etiquetaEn: "Routing / ABA (if applicable)" },
    { clave: "direccion_banco", etiqueta: "Dirección del banco", etiquetaEn: "Bank address" },
    { clave: "direccion_titular", etiqueta: "Dirección del titular", etiquetaEn: "Holder address" },
    { clave: "notas", etiqueta: "Aclaraciones (Wise, PayPal, etc.)", etiquetaEn: "Notes (Wise, PayPal, etc.)", largo: true },
  ],
};

export type DatosPago = { activo: boolean } & Record<string, string | boolean | undefined>;

/** Normaliza lo que viene del panel o de la base: solo claves conocidas, texto recortado. */
export function limpiarDatos(region: Region, crudo: unknown): DatosPago {
  const src = crudo && typeof crudo === "object" ? (crudo as Record<string, unknown>) : {};
  const out: DatosPago = { activo: src.activo === true };
  for (const c of CAMPOS[region]) {
    const v = typeof src[c.clave] === "string" ? (src[c.clave] as string).trim().slice(0, c.largo ? 1000 : 160) : "";
    if (v) out[c.clave] = v;
  }
  return out;
}

/** Devuelve un mensaje si los datos activos tienen un error evidente. */
export function validarDatos(region: Region, d: DatosPago): string | null {
  if (!d.activo) return null;
  const cuenta = region === "nacional" ? d.cbu || d.alias : d.iban;
  if (!cuenta) return region === "nacional" ? "Para activar el pago nacional cargá al menos el CBU o el alias." : "Para activar el pago internacional cargá al menos el IBAN o número de cuenta.";
  if (region === "nacional" && d.cbu && !/^\d{22}$/.test(String(d.cbu).replace(/\s/g, ""))) return "El CBU/CVU tiene que tener 22 dígitos.";
  return null;
}

export type LineaPago = { etiqueta: string; valor: string };

/** Campos con valor, en orden y con la etiqueta en el idioma pedido. */
export function lineasPago(region: Region, datos: DatosPago, lang: "es" | "en" = "es"): LineaPago[] {
  return CAMPOS[region].flatMap((c) => {
    const v = datos[c.clave];
    return typeof v === "string" && v ? [{ etiqueta: lang === "es" ? c.etiqueta : c.etiquetaEn, valor: v }] : [];
  });
}

export const dinero = (n: number, moneda: string, lang: "es" | "en" = "es") =>
  new Intl.NumberFormat(lang === "es" ? "es-AR" : "en-US", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(n);
