"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { borrarTres, firmarTres, type Firma } from "./subida";
import { embedUrl } from "@/lib/embed";

/** La base siguiente de foto: el mayor indice numerico existente + 1. */
async function baseSiguiente(): Promise<string> {
  const { data } = await admin().from("sobre_media").select("imagen").eq("tipo", "foto");
  let mayor = 0;
  for (const f of (data ?? []) as { imagen: string | null }[]) {
    const n = Number(f.imagen?.split("/").pop() ?? 0);
    if (Number.isInteger(n) && n > mayor) mayor = n;
  }
  return `sobre/${String(mayor + 1).padStart(2, "0")}`;
}

async function ordenSiguiente(): Promise<number> {
  const { data } = await admin().from("sobre_media").select("orden");
  return ((data ?? []) as { orden: number }[]).reduce((m, f) => Math.max(m, f.orden), -1) + 1;
}

export async function firmarFotoNueva(): Promise<{ base: string; firmas: Firma[] }> {
  await exigirAdmin();
  const base = await baseSiguiente();
  return { base, firmas: await firmarTres(base, false) };
}

export async function firmarFotoExistente(id: string): Promise<{ base: string; firmas: Firma[] }> {
  await exigirAdmin();
  const { data } = await admin().from("sobre_media").select("imagen,tipo").eq("id", id).maybeSingle();
  if (!data || data.tipo !== "foto" || !data.imagen) throw new Error("La foto no existe.");
  const base = data.imagen as string;
  return { base, firmas: await firmarTres(base, true) };
}

export async function crearFoto(datos: {
  base: string;
  imagen_w: number;
  imagen_h: number;
  blur: string;
  epigrafe?: string | null;
}): Promise<void> {
  await exigirAdmin();
  const orden = await ordenSiguiente();
  const { error } = await admin().from("sobre_media").insert({
    tipo: "foto",
    imagen: datos.base,
    imagen_w: datos.imagen_w,
    imagen_h: datos.imagen_h,
    blur: datos.blur,
    epigrafe: datos.epigrafe?.trim() || null,
    orden,
  });
  if (error) throw new Error(`No se pudo agregar la foto: ${error.message}`);
  invalidarSitio();
}

export async function guardarImagenFoto(
  id: string,
  datos: { imagen_w: number; imagen_h: number; blur: string }
): Promise<void> {
  await exigirAdmin();
  const { error } = await admin()
    .from("sobre_media")
    .update({ imagen_w: datos.imagen_w, imagen_h: datos.imagen_h, blur: datos.blur })
    .eq("id", id);
  if (error) throw new Error(`No se pudo guardar la foto: ${error.message}`);
  invalidarSitio();
}

export async function crearVideo(datos: { video_url: string; epigrafe?: string | null }): Promise<void> {
  await exigirAdmin();
  const limpio = datos.video_url.trim();
  if (!embedUrl(limpio)) throw new Error("Esa URL no parece un video de YouTube o Vimeo.");
  const orden = await ordenSiguiente();
  const { error } = await admin().from("sobre_media").insert({
    tipo: "video",
    video_url: limpio,
    epigrafe: datos.epigrafe?.trim() || null,
    orden,
  });
  if (error) throw new Error(`No se pudo agregar el video: ${error.message}`);
  invalidarSitio();
}

export async function actualizarMedia(
  id: string,
  campos: { epigrafe?: string | null; orden?: number; publicada?: boolean }
): Promise<void> {
  await exigirAdmin();
  const update: Record<string, unknown> = {};
  if (campos.epigrafe !== undefined) update.epigrafe = campos.epigrafe?.trim() || null;
  if (campos.orden !== undefined) {
    if (!Number.isInteger(campos.orden)) throw new Error("El orden tiene que ser un entero.");
    update.orden = campos.orden;
  }
  if (campos.publicada !== undefined) update.publicada = campos.publicada;
  if (Object.keys(update).length === 0) return;
  const { error } = await admin().from("sobre_media").update(update).eq("id", id);
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  invalidarSitio();
}

export async function borrarMedia(id: string): Promise<void> {
  await exigirAdmin();
  const { data } = await admin().from("sobre_media").select("imagen,tipo").eq("id", id).maybeSingle();
  if (!data) throw new Error("No existe.");
  if (data.tipo === "foto" && data.imagen) {
    try {
      await borrarTres(data.imagen as string);
    } catch {
      // Un archivo ya roto no debe impedir borrar la fila.
    }
  }
  const { error } = await admin().from("sobre_media").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar: ${error.message}`);
  invalidarSitio();
}
