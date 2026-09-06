"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { borrarTres, firmarTres, type Firma } from "./subida";
import { slugDesde } from "@/lib/slug";

function numeroOpc(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error("El anio tiene que ser un entero.");
  return n;
}

/** La base siguiente de lamina: el mayor indice numerico existente + 1. */
async function baseSiguiente(proyecto_id: string, slug: string): Promise<string> {
  const { data } = await admin()
    .from("proyecto_imagenes")
    .select("imagen")
    .eq("proyecto_id", proyecto_id);
  let mayor = 0;
  for (const f of (data ?? []) as { imagen: string }[]) {
    const n = Number(f.imagen.split("/").pop() ?? 0);
    if (Number.isInteger(n) && n > mayor) mayor = n;
  }
  return `proyectos/${slug}/${String(mayor + 1).padStart(2, "0")}`;
}

export async function crearProyecto(fd: FormData): Promise<string> {
  await exigirAdmin();
  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) throw new Error("El titulo no puede quedar vacio.");
  const slug = slugDesde(titulo);
  const publicado = fd.get("publicado") === "1";
  const orden = fd.get("orden") ? Number(fd.get("orden")) : 0;
  if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");

  const { data, error } = await admin()
    .from("proyectos")
    .insert({
      slug,
      titulo,
      ubicacion: String(fd.get("ubicacion") ?? "").trim() || null,
      anio: numeroOpc(fd.get("anio")),
      estado: String(fd.get("estado") ?? "").trim() || null,
      descripcion: String(fd.get("descripcion") ?? "").trim() || null,
      publicado,
      orden,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.code === "23505" ? "Ya existe un proyecto con ese titulo." : error.message);
  invalidarSitio();
  return data.id as string;
}

export async function actualizarProyecto(id: string, fd: FormData): Promise<void> {
  await exigirAdmin();
  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) throw new Error("El titulo no puede quedar vacio.");
  const orden = fd.get("orden") ? Number(fd.get("orden")) : 0;
  if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");

  const { error } = await admin()
    .from("proyectos")
    .update({
      titulo,
      ubicacion: String(fd.get("ubicacion") ?? "").trim() || null,
      anio: numeroOpc(fd.get("anio")),
      estado: String(fd.get("estado") ?? "").trim() || null,
      descripcion: String(fd.get("descripcion") ?? "").trim() || null,
      publicado: fd.get("publicado") === "1",
      orden,
    })
    .eq("id", id);
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  invalidarSitio();
}

export async function borrarProyecto(id: string): Promise<void> {
  await exigirAdmin();
  const db = admin();
  const { data: proy } = await db.from("proyectos").select("id").eq("id", id).maybeSingle();
  if (!proy) throw new Error("El proyecto no existe.");
  const { data: laminas } = await db
    .from("proyecto_imagenes")
    .select("imagen")
    .eq("proyecto_id", id);
  for (const l of (laminas ?? []) as { imagen: string }[]) {
    try {
      await borrarTres(l.imagen);
    } catch {
      // Una lamina ya rota no debe impedir borrar el proyecto.
    }
  }
  const { error } = await db.from("proyectos").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar el proyecto: ${error.message}`);
  invalidarSitio();
}

export async function firmarLaminaNueva(proyecto_id: string): Promise<{ base: string; firmas: Firma[] }> {
  await exigirAdmin();
  const { data: proy } = await admin()
    .from("proyectos")
    .select("slug")
    .eq("id", proyecto_id)
    .maybeSingle();
  if (!proy) throw new Error("El proyecto no existe.");
  const base = await baseSiguiente(proyecto_id, proy.slug as string);
  return { base, firmas: await firmarTres(base, false) };
}

export async function firmarLaminaExistente(lamina_id: string): Promise<{ base: string; firmas: Firma[] }> {
  await exigirAdmin();
  const { data } = await admin()
    .from("proyecto_imagenes")
    .select("imagen")
    .eq("id", lamina_id)
    .maybeSingle();
  if (!data) throw new Error("La lamina no existe.");
  const base = data.imagen as string;
  return { base, firmas: await firmarTres(base, true) };
}

export async function crearLamina(
  proyecto_id: string,
  datos: { base: string; imagen_w: number; imagen_h: number; blur: string; epigrafe?: string | null }
): Promise<void> {
  await exigirAdmin();
  const db = admin();
  const { data: filas } = await db
    .from("proyecto_imagenes")
    .select("orden")
    .eq("proyecto_id", proyecto_id);
  const orden = ((filas ?? []) as { orden: number }[]).reduce((m, f) => Math.max(m, f.orden), -1) + 1;

  const { error } = await db.from("proyecto_imagenes").insert({
    proyecto_id,
    imagen: datos.base,
    imagen_w: datos.imagen_w,
    imagen_h: datos.imagen_h,
    blur: datos.blur,
    epigrafe: datos.epigrafe?.trim() || null,
    orden,
  });
  if (error) throw new Error(`No se pudo crear la lamina: ${error.message}`);
  invalidarSitio();
}

export async function guardarImagenLamina(
  lamina_id: string,
  datos: { imagen_w: number; imagen_h: number; blur: string }
): Promise<void> {
  await exigirAdmin();
  const { error } = await admin()
    .from("proyecto_imagenes")
    .update({ imagen_w: datos.imagen_w, imagen_h: datos.imagen_h, blur: datos.blur })
    .eq("id", lamina_id);
  if (error) throw new Error(`No se pudo guardar la lamina: ${error.message}`);
  invalidarSitio();
}

export async function actualizarLamina(
  lamina_id: string,
  campos: { epigrafe?: string | null; orden?: number }
): Promise<void> {
  await exigirAdmin();
  const update: Record<string, unknown> = {};
  if (campos.epigrafe !== undefined) update.epigrafe = campos.epigrafe?.trim() || null;
  if (campos.orden !== undefined) {
    if (!Number.isInteger(campos.orden)) throw new Error("El orden tiene que ser un entero.");
    update.orden = campos.orden;
  }
  if (Object.keys(update).length === 0) return;
  const { error } = await admin().from("proyecto_imagenes").update(update).eq("id", lamina_id);
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  invalidarSitio();
}

export async function borrarLamina(lamina_id: string): Promise<void> {
  await exigirAdmin();
  const db = admin();
  const { data } = await db.from("proyecto_imagenes").select("imagen").eq("id", lamina_id).maybeSingle();
  if (!data) throw new Error("La lamina no existe.");
  const base = data.imagen as string;

  // La home de arquitectura muestra la lamina .../01 como portada del proyecto
  // (lib/proyectos.ts y la pagina de listado la piden fija): si esa desaparece,
  // el proyecto queda sin tarjeta en el sitio. Se reemplaza, no se borra.
  if (base.endsWith("/01")) {
    throw new Error("Es la lamina portada del proyecto (…/01). Reemplazala, no la borres.");
  }
  await borrarTres(base);
  const { error } = await db.from("proyecto_imagenes").delete().eq("id", lamina_id);
  if (error) throw new Error(`No se pudo borrar la lamina: ${error.message}`);
  invalidarSitio();
}
