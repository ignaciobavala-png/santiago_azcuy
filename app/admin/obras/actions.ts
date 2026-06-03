"use server"

import sharp from "sharp"
import { createAdminClient } from "@/lib/supabase/server"

export interface UploadImageResult {
  imagen_url: string
  blur_data_url: string
}

export async function uploadObraImage(formData: FormData): Promise<UploadImageResult> {
  const file = formData.get("imagen") as File
  if (!file || file.size === 0) throw new Error("No se recibió imagen")

  const buffer = Buffer.from(await file.arrayBuffer())
  const id = crypto.randomUUID()

  // Convertir a WebP, máx 2400px de ancho, calidad 85 — suficiente para zoom de galería
  const webp = await sharp(buffer)
    .rotate() // respeta el EXIF de orientación
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  // Thumbnail 10×10 base64 para blur placeholder
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize(10, 10, { fit: "cover" })
    .webp({ quality: 60 })
    .toBuffer()
  const blur_data_url = `data:image/webp;base64,${thumbBuffer.toString("base64")}`

  const supabase = await createAdminClient()

  const { error } = await supabase.storage
    .from("obras")
    .upload(`${id}/original.webp`, webp, {
      contentType: "image/webp",
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from("obras").getPublicUrl(`${id}/original.webp`)

  return { imagen_url: data.publicUrl, blur_data_url }
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

  // Verificar que el slug sea único
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
    publicada: false,
    precio,
    tipo_venta: (formData.get("tipo_venta") as string) || null,
    imagen_url: imagen_url || null,
    blur_data_url: blur_data_url || null,
  })

  if (error) throw new Error(error.message)
}
