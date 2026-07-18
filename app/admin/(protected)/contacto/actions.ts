"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type Consulta = Tables<"consultas">

export async function getConsultas(): Promise<Consulta[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("consultas")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function marcarLeida(id: string) {
  const supabase = await createAdminClient()
  await supabase.from("consultas").update({ leido: true }).eq("id", id)
  revalidatePath("/admin/contacto")
}

export async function marcarNoLeida(id: string) {
  const supabase = await createAdminClient()
  await supabase.from("consultas").update({ leido: false }).eq("id", id)
  revalidatePath("/admin/contacto")
}

export async function eliminarConsulta(id: string) {
  const supabase = await createAdminClient()
  await supabase.from("consultas").delete().eq("id", id)
  revalidatePath("/admin/contacto")
}
