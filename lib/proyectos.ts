import { supabase } from "./supabase";

export type Lamina = {
  id: string;
  imagen: string;
  imagen_w: number;
  imagen_h: number;
  blur: string | null;
  epigrafe: string | null;
  orden: number;
};

export type Proyecto = {
  id: string;
  slug: string;
  titulo: string;
  ubicacion: string | null;
  anio: number | null;
  estado: string | null;
  descripcion: string | null;
};

export async function proyectos(): Promise<Proyecto[]> {
  const { data } = await supabase
    .from("proyectos")
    .select("id,slug,titulo,ubicacion,anio,estado,descripcion")
    .order("orden");
  return (data ?? []) as Proyecto[];
}

export async function proyecto(slug: string) {
  const { data } = await supabase
    .from("proyectos")
    .select("id,slug,titulo,ubicacion,anio,estado,descripcion,proyecto_imagenes(id,imagen,imagen_w,imagen_h,blur,epigrafe,orden)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const { proyecto_imagenes, ...p } = data as Proyecto & { proyecto_imagenes: Lamina[] };
  return { ...p, laminas: [...proyecto_imagenes].sort((a, b) => a.orden - b.orden) };
}
