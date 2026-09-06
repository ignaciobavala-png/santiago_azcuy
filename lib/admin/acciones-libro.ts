"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";

/**
 * Guarda en una sola pasada los titulos y numeros de todos los capitulos del
 * formulario maestro de /admin/libro. El numero se puede vaciar (prologo).
 */
export async function guardarCapitulos(fd: FormData): Promise<void> {
  await exigirAdmin();
  const ids = fd.getAll("id").map(String);
  const errores: string[] = [];

  for (const id of ids) {
    const numeroRaw = fd.get(`numero_${id}`);
    const titulo = String(fd.get(`titulo_${id}`) ?? "").trim();
    if (!titulo) {
      errores.push("Un capitulo quedo sin titulo.");
      continue;
    }
    let numero: number | null = null;
    if (typeof numeroRaw === "string" && numeroRaw.trim() !== "") {
      const n = Number(numeroRaw);
      if (!Number.isInteger(n)) {
        errores.push(`El numero "${numeroRaw}" no es un entero.`);
        continue;
      }
      numero = n;
    }
    const { error } = await admin()
      .from("libro_capitulos")
      .update({ numero, titulo })
      .eq("id", id);
    if (error) errores.push(`No se pudo guardar: ${error.message}`);
  }

  if (errores.length) throw new Error(errores[0]);
  invalidarSitio();
}
