import { supabase } from "./supabase";

export type SobreMedia = {
  id: string;
  tipo: "foto" | "video";
  imagen: string | null;
  imagen_w: number | null;
  imagen_h: number | null;
  blur: string | null;
  video_url: string | null;
  epigrafe: string | null;
  orden: number;
};

export async function sobreGaleria(): Promise<SobreMedia[]> {
  const { data } = await supabase
    .from("sobre_media")
    .select("id,tipo,imagen,imagen_w,imagen_h,blur,video_url,epigrafe,orden")
    .order("orden");
  return (data ?? []) as SobreMedia[];
}
