"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export type SeccionInstitucional = {
  slug: string
  datos: Record<string, unknown>
  updated_at: string
}

export async function getSeccionesInstitucional(): Promise<SeccionInstitucional[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("institucional_secciones")
    .select("*")
    .order("slug")
  return (data ?? []) as SeccionInstitucional[]
}

export async function guardarSeccionInstitucional(slug: string, datos: Record<string, unknown>) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("institucional_secciones")
    .upsert({ slug, datos: datos as Json, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/institucional")
  revalidatePath("/admin/institucional")
}
