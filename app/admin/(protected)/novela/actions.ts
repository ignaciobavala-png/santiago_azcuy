"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export type NovelaContenido = {
  titulo: string | null
  subtitulo: string | null
  descripcion: string | null
  portada_url: string | null
  spotify_show_id: string | null
}

export async function getNovelaContenido(): Promise<NovelaContenido | null> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("novela_contenido")
    .select("titulo, subtitulo, descripcion, portada_url, spotify_show_id")
    .eq("id", 1)
    .single()
  return data ?? null
}

export async function guardarNovelaContenido(contenido: NovelaContenido) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("novela_contenido")
    .upsert({ id: 1, ...contenido, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/el-aprendiz")
  revalidatePath("/admin/novela")
}
