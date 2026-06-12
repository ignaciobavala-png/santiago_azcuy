"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export async function guardarBiografia(texto: string, frase?: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("biografia")
    .update({ texto, frase: frase ?? null, updated_at: new Date().toISOString() })
    .eq("id", 1)
  if (error) throw new Error(error.message)
  revalidatePath("/sobre")
  revalidatePath("/")
}

export async function crearExposicion(formData: FormData) {
  const supabase = await createAdminClient()
  const año = formData.get("año") as string | null
  const fecha_inicio = año ? `${año}-01-01` : null

  const { error } = await supabase.from("exposiciones").insert({
    titulo: formData.get("titulo") as string,
    lugar: (formData.get("lugar") as string) || null,
    ciudad: (formData.get("ciudad") as string) || null,
    pais: (formData.get("pais") as string) || null,
    tipo: (formData.get("tipo") as string) || null,
    fecha_inicio,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/sobre")
  revalidatePath("/admin/biografia")
}

export async function eliminarExposicion(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("exposiciones").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/sobre")
  revalidatePath("/admin/biografia")
}
