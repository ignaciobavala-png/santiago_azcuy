import { supabase } from "./supabase";

export type TipoMusica = "album" | "clip" | "tema" | "entrevista";

export type Pista = {
  id: string;
  tipo: TipoMusica;
  titulo: string;
  /** Id de la entidad, no una URL: videoId de YouTube. */
  recurso: string;
  plataforma: string | null;
  duracion: string | null;
  descripcion: string | null;
  miniatura: string;
  anio: number | null;
};

/** Perfil de artista en Spotify: fijo, no es un item de lista. */
export const SPOTIFY_ARTISTA = "7d5QFkKBQY60oiwgEPVScy";
export const CANAL_YOUTUBE = "https://www.youtube.com/@Santiazcuy/videos";
export const AUDIOLIBRO = { id: "19RGiUN_2fY", duracion: "7:37:03" };

export async function musica(): Promise<Record<TipoMusica, Pista[]>> {
  const { data, error } = await supabase
    .from("musica")
    .select("id,tipo,titulo,recurso,plataforma,duracion,descripcion,miniatura,anio")
    .eq("visible", true)
    .order("orden");
  if (error) throw error;

  const vacio: Record<TipoMusica, Pista[]> = { album: [], clip: [], tema: [], entrevista: [] };
  for (const p of (data ?? []) as Pista[]) vacio[p.tipo].push(p);
  return vacio;
}
