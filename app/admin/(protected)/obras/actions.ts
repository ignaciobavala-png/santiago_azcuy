"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export interface SignedUploadResult {
  signedUrl: string
  path: string
  publicUrl: string
}

// Genera una URL firmada para que el browser suba directo a Supabase Storage
// El archivo nunca pasa por Vercel — evita el límite de 4.5MB de funciones serverless
export async function getSignedUploadUrl(): Promise<SignedUploadResult> {
  const supabase = await createAdminClient()
  const path = `${crypto.randomUUID()}/original`

  const { data, error } = await supabase.storage
    .from("obras")
    .createSignedUploadUrl(path)

  if (error || !data) throw new Error(error?.message ?? "Error al crear URL de subida")

  const { data: urlData } = supabase.storage.from("obras").getPublicUrl(path)

  return { signedUrl: data.signedUrl, path, publicUrl: urlData.publicUrl }
}

export async function crearObra(formData: FormData) {
  const supabase = await createAdminClient()

  const titulo = formData.get("titulo") as string
  const slug = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

  const imagen_url = formData.get("imagen_url") as string | null
  const blur_data_url = formData.get("blur_data_url") as string | null
  const serie_id = formData.get("serie_id") as string | null
  const año = formData.get("año") ? Number(formData.get("año")) : null
  const precio = formData.get("precio") ? Number(formData.get("precio")) : null
  const dimensiones_alto = formData.get("alto") ? Number(formData.get("alto")) : null
  const dimensiones_ancho = formData.get("ancho") ? Number(formData.get("ancho")) : null

  const dimensiones =
    dimensiones_alto && dimensiones_ancho
      ? `${dimensiones_alto} × ${dimensiones_ancho} cm`
      : null

  const { data: existing } = await supabase
    .from("obras")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { error } = await supabase.from("obras").insert({
    slug: finalSlug,
    titulo,
    año,
    tecnica: (formData.get("tecnica") as string) || null,
    dimensiones,
    dimensiones_alto,
    dimensiones_ancho,
    descripcion: (formData.get("descripcion") as string) || null,
    serie_id: serie_id || null,
    disponible: formData.get("disponible") === "true",
    publicada: true,
    precio,
    tipo_venta: (formData.get("tipo_venta") as string) || null,
    imagen_url: imagen_url || null,
    blur_data_url: blur_data_url || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/obras")
  revalidatePath("/")
}

export async function togglePublicada(id: string, publicada: boolean) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("obras")
    .update({ publicada })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/obras")
  revalidatePath("/")
}

export async function eliminarObra(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("obras").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/obras")
  revalidatePath("/")
}
