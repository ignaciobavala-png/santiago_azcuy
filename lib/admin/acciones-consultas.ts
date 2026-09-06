"use server";

import { admin } from "./cliente";
import { exigirAdmin } from "./sesion";

export async function alternarLeida(id: string): Promise<void> {
  await exigirAdmin();
  const { data } = await admin().from("consultas").select("leida").eq("id", id).maybeSingle();
  if (!data) throw new Error("La consulta no existe.");
  const { error } = await admin().from("consultas").update({ leida: !data.leida }).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar: ${error.message}`);
}

export async function borrarConsulta(id: string): Promise<void> {
  await exigirAdmin();
  const { error } = await admin().from("consultas").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar la consulta: ${error.message}`);
}
