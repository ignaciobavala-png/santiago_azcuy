import { supabase } from "./supabase";
import type { Categoria, Obra } from "./tipos";

const CAMPOS =
  "id,slug,titulo,anio,tecnica,ancho_cm,alto_cm,categoria,serie_id,es_encargo,destacada,disponible,descripcion,imagen,imagen_w,imagen_h,blur";

export async function obras(filtros: {
  categoria?: Categoria;
  encargo?: boolean;
  limite?: number;
} = {}): Promise<Obra[]> {
  let q = supabase.from("obras").select(CAMPOS).order("orden");
  if (filtros.categoria) q = q.eq("categoria", filtros.categoria);
  if (filtros.encargo) q = q.eq("es_encargo", true);
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
  const { data } = await supabase.from("obras").select("categoria");
  const c = { total: 0, figurativo: 0, abstracto: 0, dibujo: 0 } as Record<string, number>;
  for (const r of data ?? []) {
    c.total++;
    c[(r as { categoria: string }).categoria]++;
  }
  return c;
}

export async function texto(clave: string): Promise<string> {
  const { data } = await supabase.from("textos").select("contenido").eq("clave", clave).maybeSingle();
  return (data as { contenido: string } | null)?.contenido ?? "";
}
