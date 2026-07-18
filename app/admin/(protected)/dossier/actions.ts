"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export type SeccionDossier = {
  slug: string
  datos: Record<string, unknown>
  updated_at: string
}

export async function getSeccionesDossier(): Promise<SeccionDossier[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("dossier_secciones")
    .select("*")
    .order("slug")
  return (data ?? []) as SeccionDossier[]
}

export async function guardarSeccionDossier(slug: string, datos: Record<string, unknown>) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("dossier_secciones")
    .upsert({ slug, datos: datos as Json, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/dossier")
  revalidatePath("/admin/dossier")
}
