"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";
import { invalidarSitio } from "./revalidar";
import { idYouTube, miniaturaYouTube, tituloYouTube } from "./youtube";

const TIPOS = ["album", "clip", "tema", "entrevista"] as const;
type Tipo = (typeof TIPOS)[number];
const esTipo = (v: unknown): v is Tipo => typeof v === "string" && (TIPOS as readonly string[]).includes(v);

async function datosDesdeUrl(url: string) {
  const id = idYouTube(url);
  if (!id) throw new Error("Esa URL no parece un video de YouTube.");
  const titulo = await tituloYouTube(id);
  if (!titulo) throw new Error("No se pudo leer el titulo desde YouTube. Verificá la URL o la conexion.");
  const miniatura = await miniaturaYouTube(id);
  return { id, titulo, miniatura };
}

export async function crearPista(fd: FormData): Promise<void> {
  await exigirAdmin();
  const tipo = fd.get("tipo");
  if (!esTipo(tipo)) throw new Error("Elegi un tipo de pieza.");
  const url = String(fd.get("url") ?? "");
  if (!url.trim()) throw new Error("Pega la URL del video.");

  const { id, titulo, miniatura } = await datosDesdeUrl(url);
  const anio = fd.get("anio") ? Number(fd.get("anio")) : null;
  if (anio !== null && !Number.isInteger(anio)) throw new Error("El anio tiene que ser un entero.");
  const ordenCrudo = String(fd.get("orden") ?? "").trim();
  let orden: number;
  if (ordenCrudo) {
    orden = Number(ordenCrudo);
    if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");
  } else {
    // Sin orden, la pieza nueva cae al final de su tipo.
    const { data } = await admin().from("musica").select("orden").eq("tipo", tipo).order("orden", { ascending: false }).limit(1);
    const filas = (data ?? []) as { orden: number }[];
    orden = (filas[0]?.orden ?? 0) + 1;
  }

  const { error } = await admin().from("musica").insert({
    tipo,
    titulo,
    recurso: id,
    plataforma: "youtube",
    duracion: String(fd.get("duracion") ?? "").trim() || null,
    descripcion: String(fd.get("descripcion") ?? "").trim() || null,
    anio,
    miniatura,
    visible: true,
    orden,
  });
  if (error) throw new Error(`No se pudo crear la pieza: ${error.message}`);
  invalidarSitio();
}

export async function actualizarPista(id: string, fd: FormData): Promise<void> {
  await exigirAdmin();
  const tipo = fd.get("tipo");
  if (!esTipo(tipo)) throw new Error("Tipo invalido.");
  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) throw new Error("El titulo no puede quedar vacio.");
  const anio = fd.get("anio") ? Number(fd.get("anio")) : null;
  if (anio !== null && !Number.isInteger(anio)) throw new Error("El anio tiene que ser un entero.");
  const orden = fd.get("orden") ? Number(fd.get("orden")) : 0;
  if (!Number.isInteger(orden)) throw new Error("El orden tiene que ser un entero.");
  const recurso = String(fd.get("recurso") ?? "").trim();
  if (!recurso) throw new Error("Falta el id del video.");

  const { error } = await admin()
    .from("musica")
    .update({
      tipo,
      titulo,
      recurso,
      duracion: String(fd.get("duracion") ?? "").trim() || null,
      descripcion: String(fd.get("descripcion") ?? "").trim() || null,
      anio,
      orden,
    })
    .eq("id", id);
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  invalidarSitio();
}

export async function alternarVisible(id: string): Promise<void> {
  await exigirAdmin();
  const { data } = await admin().from("musica").select("visible").eq("id", id).maybeSingle();
  if (!data) throw new Error("La pieza no existe.");
  const { error } = await admin().from("musica").update({ visible: !data.visible }).eq("id", id);
  if (error) throw new Error(`No se pudo cambiar la visibilidad: ${error.message}`);
  invalidarSitio();
}

/**
 * Sube o baja una pieza dentro de su tipo intercambiando el orden con la
 * contigua. Se relee la lista del tipo ordenada por (orden, creado_at) para
 * saber quien es el vecino, y se intercambian los dos valores: nunca quedan
 * dos piezas del mismo tipo con el mismo orden por esta operacion.
 */
export async function moverPista(id: string, direccion: "arriba" | "abajo"): Promise<void> {
  await exigirAdmin();
  const db = admin();
  const { data: pista } = await db.from("musica").select("id,tipo").eq("id", id).maybeSingle();
  if (!pista) throw new Error("La pieza no existe.");

  const { data: lista } = await db
    .from("musica")
    .select("id,orden")
    .eq("tipo", pista.tipo as Tipo)
    .order("orden")
    .order("creado_at", { ascending: true });
  const filas = (lista ?? []) as { id: string; orden: number }[];
  const i = filas.findIndex((f) => f.id === id);
  const j = direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= filas.length) return;

  const a = filas[i].orden;
  const b = filas[j].orden;
  await Promise.all([
    db.from("musica").update({ orden: b }).eq("id", filas[i].id),
    db.from("musica").update({ orden: a }).eq("id", filas[j].id),
  ]);
  invalidarSitio();
}

export async function borrarPista(id: string): Promise<void> {
  await exigirAdmin();
  const { error } = await admin().from("musica").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar la pieza: ${error.message}`);
  invalidarSitio();
}
