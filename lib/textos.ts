import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { t, type Diccionario, type Lang } from "@/lib/i18n";

/**
 * Capa editable sobre el diccionario de `lib/i18n.ts`.
 *
 * El diccionario del codigo sigue siendo la fuente de los textos por defecto:
 * define que frases existen, su forma y su traduccion de fabrica. La tabla
 * `textos` guarda solo lo que Santiago reescribio desde el panel, con la clave
 * `ui.` + la ruta dentro del diccionario (`ui.home.statement`), y el ingles en
 * la misma clave con `.en` al final, igual que los bloques largos.
 *
 * Guardar solo lo pisado y no el diccionario entero tiene dos consecuencias
 * buenas: una frase nueva aparece traducida sin migracion, y borrar el campo en
 * el panel devuelve el texto original en vez de dejar un hueco en blanco.
 */
export const PREFIJO = "ui.";

/** `{ home: { statement: "…" } }` -> `{ "home.statement": "…" }`. */
export function aplanar(nodo: unknown, prefijo = ""): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(nodo as Record<string, unknown>)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave;
    if (typeof valor === "string") salida[ruta] = valor;
    else if (valor && typeof valor === "object") Object.assign(salida, aplanar(valor, ruta));
  }
  return salida;
}

/**
 * Escribe una hoja por su ruta. Si la ruta ya no existe en el diccionario —una
 * clave que se guardo en el panel y despues se renombro en el codigo— no hace
 * nada: la fila vieja queda inerte en vez de inventar un campo fantasma.
 */
function fijar(raiz: Record<string, unknown>, ruta: string, valor: string): void {
  const partes = ruta.split(".");
  const hoja = partes.pop()!;
  let nodo = raiz;
  for (const parte of partes) {
    const hijo = nodo[parte];
    if (!hijo || typeof hijo !== "object") return;
    nodo = hijo as Record<string, unknown>;
  }
  if (typeof nodo[hoja] === "string") nodo[hoja] = valor;
}

/**
 * El diccionario del idioma con lo editado ya aplicado. Va envuelto en `cache`
 * de React para que el layout y la pagina del mismo render compartan una sola
 * consulta.
 */
export const dic = cache(async (lang: Lang): Promise<Diccionario> => {
  const { data, error } = await supabase
    .from("textos")
    .select("clave,contenido")
    .like("clave", `${PREFIJO}%`);

  // Si la base no contesta, el sitio sale con los textos del codigo. Una pagina
  // en su version de fabrica es mejor que una pagina que no carga.
  if (error || !data) return t(lang);

  const salida = structuredClone(t(lang)) as unknown as Record<string, unknown>;
  const pisados = new Map(
    (data as { clave: string; contenido: string }[])
      .filter((f) => f.contenido)
      .map((f) => [f.clave, f.contenido])
  );

  for (const [clave, contenido] of pisados) {
    const esIngles = clave.endsWith(".en");
    if (esIngles !== (lang === "en")) continue;
    const ruta = clave.slice(PREFIJO.length, esIngles ? -3 : undefined);
    fijar(salida, ruta, contenido);
  }

  return salida as unknown as Diccionario;
});
