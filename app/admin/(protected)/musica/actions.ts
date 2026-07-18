"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export interface SignedUploadResult {
  signedUrl: string
  path: string
  publicUrl: string
}

// Portadas de álbum: reutiliza el bucket público "obras".
export async function getSignedUploadUrl(): Promise<SignedUploadResult> {
  const supabase = await createAdminClient()
  const path = `albumes/${crypto.randomUUID()}/portada`

  const { data, error } = await supabase.storage
    .from("obras")
    .createSignedUploadUrl(path)

  if (error || !data) throw new Error(error?.message ?? "Error al crear URL de subida")

  const { data: urlData } = supabase.storage.from("obras").getPublicUrl(path)
  return { signedUrl: data.signedUrl, path, publicUrl: urlData.publicUrl }
}

function revalidarMusica() {
  revalidatePath("/musica")
  revalidatePath("/admin/musica")
}

// Extrae el ID de un video de YouTube desde una URL o desde el ID pelado.
function extraerYoutubeId(input: string): string | null {
  const s = input.trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|\/v\/)([\w-]{11})/)
  return m ? m[1] : null
}

// ── Videos (videoclip | vivo) ───────────────────────────────────────
export async function crearVideo(formData: FormData) {
  const supabase = await createAdminClient()

  const seccion = formData.get("seccion") as string
  if (seccion !== "videoclip" && seccion !== "vivo") {
    throw new Error("Sección inválida")
  }

  const youtube_id = extraerYoutubeId((formData.get("youtube") as string) || "")
  if (!youtube_id) throw new Error("Link o ID de YouTube inválido")

  const orden = formData.get("orden") ? Number(formData.get("orden")) : null

  const { error } = await supabase.from("videos_musica").insert({
    seccion,
    youtube_id,
    titulo: (formData.get("titulo") as string) || null,
    orden,
  })

  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function toggleVideo(id: string, activo: boolean) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("videos_musica").update({ activo }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function eliminarVideo(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("videos_musica").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

// ── Álbumes ─────────────────────────────────────────────────────────
export async function crearAlbum(formData: FormData) {
  const supabase = await createAdminClient()

  const titulo = (formData.get("titulo") as string)?.trim()
  if (!titulo) throw new Error("El título es obligatorio")

  const norm = (v: FormDataEntryValue | null) => {
    const s = (v as string)?.trim()
    return s ? s : null
  }

  const { error } = await supabase.from("albumes").insert({
    titulo,
    año: formData.get("año") ? Number(formData.get("año")) : null,
    portada_url: norm(formData.get("portada_url")),
    spotify_url: norm(formData.get("spotify_url")),
    youtube_music_url: norm(formData.get("youtube_music_url")),
    apple_music_url: norm(formData.get("apple_music_url")),
    orden: formData.get("orden") ? Number(formData.get("orden")) : null,
  })

  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function toggleAlbum(id: string, activo: boolean) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("albumes").update({ activo }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function eliminarAlbum(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("albumes").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

// ── Plataformas ─────────────────────────────────────────────────────
export async function crearPlataforma(formData: FormData) {
  const supabase = await createAdminClient()

  const nombre = (formData.get("nombre") as string)?.trim()
  if (!nombre) throw new Error("El nombre es obligatorio")

  const url = (formData.get("url") as string)?.trim() || null
  const orden = formData.get("orden") ? Number(formData.get("orden")) : null

  const { error } = await supabase.from("plataformas").insert({ nombre, url, orden })
  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function actualizarPlataforma(id: string, url: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("plataformas")
    .update({ url: url.trim() || null })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function togglePlataforma(id: string, activo: boolean) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("plataformas").update({ activo }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}

export async function eliminarPlataforma(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("plataformas").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidarMusica()
}
