import { supabase } from "./supabase";
import type { Categoria, Obra } from "./tipos";
import type { Lang } from "./i18n";

const CAMPOS =
  "id,slug,titulo,anio,tecnica,ancho_cm,alto_cm,categoria,serie_id,es_encargo,destacada,en_carrusel,estado,descripcion,imagen,imagen_w,imagen_h,blur";

export async function obras(filtros: {
  categoria?: Categoria;
  encargo?: boolean;
  enCarrusel?: boolean;
  limite?: number;
} = {}): Promise<Obra[]> {
  // Cronologia cuando el dato existe: primero las obras con año, de la mas
  // nueva a la mas vieja; las que no tienen año quedan al final, en el orden
  // manual que ya traian. `orden` sigue siendo el desempate (y el unico
  // criterio para las obras sin fecha), asi que el panel no pierde el control
  // de esas filas.
  let q = supabase
    .from("obras")
    .select(CAMPOS)
    .order("anio", { ascending: false, nullsFirst: false })
    .order("orden");
  if (filtros.categoria) q = q.eq("categoria", filtros.categoria);
  if (filtros.encargo) q = q.eq("es_encargo", true);
  if (filtros.enCarrusel) q = q.eq("en_carrusel", true);
  if (filtros.limite) q = q.limit(filtros.limite);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Obra[];
}

export async function obra(slug: string): Promise<Obra | null> {
  const { data } = await supabase.from("obras").select(CAMPOS).eq("slug", slug).maybeSingle();
  return (data as Obra) ?? null;
}

export async function conteos() {
  const { data } = await supabase.from("obras").select("categoria,es_encargo");
  const c = { total: 0, figurativo: 0, abstracto: 0, dibujo: 0, encargos: 0 } as Record<string, number>;
  for (const r of data ?? []) {
    const fila = r as { categoria: string; es_encargo: boolean };
    c.total++;
    c[fila.categoria]++;
    if (fila.es_encargo) c.encargos++;
  }
  return c;
}

/**
 * Los textos largos (bio, statement, sinopsis) viven en la tabla `textos`, con
 * la version en ingles bajo la misma clave mas ".en". Asi el idioma no obliga a
 * una columna nueva ni a duplicar filas: si la traduccion todavia no se cargo,
 * cae en el castellano en vez de dejar el bloque vacio.
 */
export async function texto(clave: string, lang: Lang = "es"): Promise<string> {
  const claves = lang === "es" ? [clave] : [`${clave}.en`, clave];
  const { data } = await supabase
    .from("textos")
    .select("clave,contenido")
    .in("clave", claves);
  const filas = (data ?? []) as { clave: string; contenido: string }[];
  for (const c of claves) {
    const hit = filas.find((f) => f.clave === c);
    if (hit?.contenido) return hit.contenido;
  }
  return "";
}
