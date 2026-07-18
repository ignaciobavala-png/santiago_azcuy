"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export interface BannerSignedUploadResult {
  signedUrl: string
  publicUrl: string
}

/** URL firmada para subir un video de fondo al bucket público "hero-videos". */
export async function getBannerSignedUploadUrl(ext = "mp4"): Promise<BannerSignedUploadResult> {
  const supabase = await createAdminClient()
  const path = `banner-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const { data, error } = await supabase.storage
    .from("hero-videos")
    .createSignedUploadUrl(path)

  if (error || !data) throw new Error(error?.message ?? "Error al crear URL de subida")

  const { data: urlData } = supabase.storage.from("hero-videos").getPublicUrl(path)
  return { signedUrl: data.signedUrl, publicUrl: urlData.publicUrl }
}

function revalidarFondo() {
  // El fondo (DesktopBackground) vive en el layout de (site): afecta a todas las páginas.
  revalidatePath("/", "layout")
  revalidatePath("/admin/hero")
}

export async function crearBanner(formData: FormData) {
  const supabase = await createAdminClient()

  const video_url = (formData.get("video_url") as string)?.trim()
  if (!video_url) throw new Error("Falta el video del banner")

  const titulo = (formData.get("titulo") as string)?.trim() || null
  const orden = formData.get("orden") ? Number(formData.get("orden")) : null

  const { error } = await supabase.from("banners").insert({ video_url, titulo, orden })
  if (error) throw new Error(error.message)
  revalidarFondo()
}

export async function toggleBanner(id: string, activo: boolean) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("banners").update({ activo }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidarFondo()
}

export async function actualizarOrdenBanner(id: string, orden: number | null) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("banners").update({ orden }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidarFondo()
}

export async function eliminarBanner(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("banners").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidarFondo()
}

export async function getBannersAdmin() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("banners")
    .select("id, titulo, video_url, poster_url, orden, activo")
    .order("orden", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
  return data ?? []
}
