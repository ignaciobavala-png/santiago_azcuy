"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";

/**
 * Guarda el par es/en de una clave. La version en ingles vive en la misma
 * tabla con la clave mas ".en"; si quedo vacia y la fila existia se borra,
 * para que el sitio caiga limpio al castellano en vez de guardar una
 * traduccion vacia. Si nunca existio y esta vacia, no se crea.
 */
export async function guardarTexto(clave: string, es: string, en: string): Promise<void> {
  await exigirAdmin();
  if (!clave) throw new Error("Clave invalida.");

  const db = admin();
  const contenidoEs = es.trim();
  const contenidoEn = en.trim();

  const { error: e1 } = await db.from("textos").upsert(
    { clave, contenido: contenidoEs },
    { onConflict: "clave" }
  );
  if (e1) throw new Error(`No se pudo guardar: ${e1.message}`);

  const claveEn = `${clave}.en`;
  const { data: filaEn } = await db.from("textos").select("clave").eq("clave", claveEn).maybeSingle();
  if (contenidoEn) {
    const { error: e2 } = await db.from("textos").upsert(
      { clave: claveEn, contenido: contenidoEn },
      { onConflict: "clave" }
    );
    if (e2) throw new Error(`No se pudo guardar la traduccion: ${e2.message}`);
  } else if (filaEn) {
    const { error: e2 } = await db.from("textos").delete().eq("clave", claveEn);
    if (e2) throw new Error(`No se pudo quitar la traduccion vacia: ${e2.message}`);
  }

  invalidarSitio();
}
