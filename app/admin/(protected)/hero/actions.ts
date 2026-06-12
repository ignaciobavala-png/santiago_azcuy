"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export interface HeroSignedUploadResult {
  signedUrl: string
  publicUrl: string
}

export async function getHeroSignedUploadUrl(): Promise<HeroSignedUploadResult> {
  const supabase = await createAdminClient()
  const path = `hero-${Date.now()}.mp4`

  const { data, error } = await supabase.storage
    .from("hero-videos")
    .createSignedUploadUrl(path)

  if (error || !data) throw new Error(error?.message ?? "Error al crear URL de subida")

  const { data: urlData } = supabase.storage.from("hero-videos").getPublicUrl(path)

  return { signedUrl: data.signedUrl, publicUrl: urlData.publicUrl }
}

export async function guardarHeroBanner(videoUrl: string | null) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("hero_banner")
    .update({ video_url: videoUrl, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (error) throw new Error(error.message)

  revalidatePath("/")
}

export async function getHeroBanner() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("hero_banner")
    .select("video_url, poster_url, activo")
    .eq("id", 1)
    .single()
  return data
}
