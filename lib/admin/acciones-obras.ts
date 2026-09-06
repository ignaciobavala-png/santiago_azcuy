"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { borrarTres, firmarTres, type Firma } from "./subida";
import { CATEGORIAS, type Categoria } from "@/lib/tipos";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function esCategoria(v: unknown): v is Categoria {
  return typeof v === "string" && (CATEGORIAS as string[]).includes(v);
}

export type CamposObra = {
  titulo?: string;
  categoria?: Categoria;
  anio?: number | null;
  tecnica?: string | null;
  ancho_cm?: number | null;
  alto_cm?: number | null;
  serie_id?: string | null;
  es_encargo?: boolean;
  destacada?: boolean;
  disponible?: boolean;
  publicada?: boolean;
  descripcion?: string | null;
  orden?: number;
};

/** Normaliza los campos sueltos que pueden venir de un toggle o de un form. */
function limpiarCampos(campos: CamposObra): Partial<Record<string, unknown>> {
  const limpios: Partial<Record<string, unknown>> = {};
  const textoOpc = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const bool = (v: unknown) => typeof v === "boolean";

  if (campos.titulo !== undefined) {
    const t = textoOpc(campos.titulo);
    if (!t) throw new Error("El titulo no puede quedar vacio.");
    limpios.titulo = t;
  }
  if (campos.categoria !== undefined) {
    if (!esCategoria(campos.categoria)) throw new Error("Categoria no valida.");
    limpios.categoria = campos.categoria;
  }
  if (campos.anio !== undefined) {
    if (campos.anio !== null && !Number.isInteger(campos.anio)) throw new Error("El anio tiene que ser un entero.");
    limpios.anio = campos.anio;
  }
  if (campos.tecnica !== undefined) limpios.tecnica = textoOpc(campos.tecnica);
  if (campos.descripcion !== undefined) limpios.descripcion = textoOpc(campos.descripcion);
  for (const k of ["ancho_cm", "alto_cm"] as const) {
    if (campos[k] !== undefined) {
      if (campos[k] !== null && (typeof campos[k] !== "number" || !Number.isFinite(campos[k])))
        throw new Error(`${k} no es un numero valido.`);
      limpios[k] = campos[k];
    }
  }
  if (campos.serie_id !== undefined) limpios.serie_id = textoOpc(campos.serie_id);
  for (const k of ["es_encargo", "destacada", "disponible", "publicada"] as const) {
    if (campos[k] !== undefined) {
      if (!bool(campos[k])) throw new Error(`${k} no es valido.`);
      limpios[k] = campos[k];
    }
  }
  if (campos.orden !== undefined) {
    if (!Number.isInteger(campos.orden)) throw new Error("El orden tiene que ser un entero.");
    limpios.orden = campos.orden;
  }
  return limpios;
}

export async function firmarSubidaObraNueva(slug: string): Promise<Firma[]> {
  await exigirAdmin();
  if (!SLUG.test(slug)) throw new Error("El slug no es valido.");
  return firmarTres(`obras/${slug}`, false);
}

/** Para reemplazar la imagen de una obra existente se reusa su path real. */
export async function firmarSubidaObraExistente(id: string): Promise<Firma[]> {
  await exigirAdmin();
  const { data } = await admin().from("obras").select("imagen").eq("id", id).maybeSingle();
  if (!data) throw new Error("La obra no existe.");
  return firmarTres(data.imagen as string, true);
}

export async function crearObra(datos: {
  slug: string;
  titulo: string;
  categoria: string;
  anio?: number | null;
  tecnica?: string | null;
  ancho_cm?: number | null;
  alto_cm?: number | null;
  serie_id?: string | null;
  es_encargo: boolean;
  destacada: boolean;
  disponible: boolean;
  publicada: boolean;
  descripcion?: string | null;
  orden: number;
  imagen_w: number;
  imagen_h: number;
  blur: string;
}): Promise<void> {
  await exigirAdmin();
  const titulo = datos.titulo?.trim();
  if (!titulo) throw new Error("El titulo no puede quedar vacio.");
  if (!SLUG.test(datos.slug)) throw new Error("El slug no es valido.");
  if (!esCategoria(datos.categoria)) throw new Error("Elegi una categoria.");

  const { error } = await admin().from("obras").insert({
    slug: datos.slug,
    titulo,
    categoria: datos.categoria,
    anio: datos.anio ?? null,
    tecnica: datos.tecnica?.trim() || null,
    ancho_cm: datos.ancho_cm ?? null,
    alto_cm: datos.alto_cm ?? null,
    serie_id: datos.serie_id?.trim() || null,
    es_encargo: datos.es_encargo,
    destacada: datos.destacada,
    disponible: datos.disponible,
    publicada: datos.publicada,
    descripcion: datos.descripcion?.trim() || null,
    orden: Number.isInteger(datos.orden) ? datos.orden : 0,
    imagen: `obras/${datos.slug}`,
    imagen_w: datos.imagen_w,
    imagen_h: datos.imagen_h,
    blur: datos.blur,
  });
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una obra con ese titulo (mismo slug).");
    throw new Error(`No se pudo crear la obra: ${error.message}`);
  }
  invalidarSitio();
}

export async function actualizarObra(id: string, campos: CamposObra): Promise<void> {
  await exigirAdmin();
  const limpios = limpiarCampos(campos);
  if (Object.keys(limpios).length === 0) throw new Error("No hay campos para guardar.");
  const { error } = await admin().from("obras").update(limpios).eq("id", id);
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  invalidarSitio();
}

export async function guardarImagenObra(
  id: string,
  datos: { imagen_w: number; imagen_h: number; blur: string }
): Promise<void> {
  await exigirAdmin();
  const { error } = await admin()
    .from("obras")
    .update({ imagen_w: datos.imagen_w, imagen_h: datos.imagen_h, blur: datos.blur })
    .eq("id", id);
  if (error) throw new Error(`No se pudo guardar la imagen: ${error.message}`);
  invalidarSitio();
}

export async function borrarObra(id: string): Promise<void> {
  await exigirAdmin();
  const { data } = await admin().from("obras").select("imagen").eq("id", id).maybeSingle();
  if (!data) throw new Error("La obra no existe.");

  const base = data.imagen as string;
  await borrarTres(base);
  const { error } = await admin().from("obras").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar la obra: ${error.message}`);
  invalidarSitio();
}
