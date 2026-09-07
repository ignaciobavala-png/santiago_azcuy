"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { PREFIJO } from "@/lib/textos";

export type CambioTexto = { clave: string; es: string; en: string };

/**
 * Guarda varios pares es/en de una vez. La version en ingles vive en la misma
 * tabla con la clave mas ".en".
 *
 * Vaciar un campo no guarda un texto vacio, borra la fila. En las claves `ui.`
 * eso devuelve el texto que trae el codigo, que es la unica forma de que
 * "dejarlo como estaba" sea posible desde el panel. En los bloques largos, que
 * no tienen respaldo en el codigo, la fila se conserva con contenido vacio para
 * no perder el titulo con el que figura en el listado.
 */
export async function guardarTextos(cambios: CambioTexto[]): Promise<void> {
  await exigirAdmin();
  if (cambios.some((c) => !c.clave)) throw new Error("Clave invalida.");
  if (cambios.length === 0) return;

  const db = admin();
  const aEscribir: { clave: string; contenido: string }[] = [];
  const aBorrar: string[] = [];

  for (const { clave, es, en } of cambios) {
    const contenidoEs = es.trim();
    const contenidoEn = en.trim();
    const pisaAlCodigo = clave.startsWith(PREFIJO);

    if (contenidoEs) aEscribir.push({ clave, contenido: contenidoEs });
    else if (pisaAlCodigo) aBorrar.push(clave);
    else aEscribir.push({ clave, contenido: "" });

    if (contenidoEn) aEscribir.push({ clave: `${clave}.en`, contenido: contenidoEn });
    else aBorrar.push(`${clave}.en`);
  }

  if (aEscribir.length) {
    const { error } = await db.from("textos").upsert(aEscribir, { onConflict: "clave" });
    if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  }
  if (aBorrar.length) {
    const { error } = await db.from("textos").delete().in("clave", aBorrar);
    if (error) throw new Error(`No se pudo limpiar: ${error.message}`);
  }

  invalidarSitio();
}

export async function guardarTexto(clave: string, es: string, en: string): Promise<void> {
  await guardarTextos([{ clave, es, en }]);
}
