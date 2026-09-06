"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { slugDesde } from "@/lib/slug";

export async function crearSerie(fd: FormData): Promise<void> {
  await exigirAdmin();
  const nombre = String(fd.get("nombre") ?? "").trim();
  if (!nombre) throw new Error("El nombre no puede quedar vacio.");
  const slug = String(fd.get("slug") ?? "").trim() || slugDesde(nombre);
  const descripcion = String(fd.get("descripcion") ?? "").trim() || null;
  const orden = Number(fd.get("orden") ?? 0);
  if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");

  const { error } = await admin().from("series").insert({ nombre, slug, descripcion, orden });
  if (error) throw new Error(error.code === "23505" ? "Ya existe una serie con ese slug." : error.message);
  invalidarSitio();
}

export async function actualizarSerie(id: string, fd: FormData): Promise<void> {
  await exigirAdmin();
  const nombre = String(fd.get("nombre") ?? "").trim();
  if (!nombre) throw new Error("El nombre no puede quedar vacio.");
  const slug = String(fd.get("slug") ?? "").trim();
  if (!slug) throw new Error("El slug no puede quedar vacio.");
  const descripcion = String(fd.get("descripcion") ?? "").trim() || null;
  const orden = Number(fd.get("orden") ?? 0);
  if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");

  const { error } = await admin().from("series").update({ nombre, slug, descripcion, orden }).eq("id", id);
  if (error) throw new Error(error.code === "23505" ? "Ya existe otra serie con ese slug." : error.message);
  invalidarSitio();
}

export async function borrarSerie(id: string): Promise<void> {
  await exigirAdmin();
  // El FK de obras.serie_id es ON DELETE SET NULL: las obras quedan sin serie.
  const { error } = await admin().from("series").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar la serie: ${error.message}`);
  invalidarSitio();
}
