"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"

export async function crearSerie(formData: FormData) {
  const supabase = await createAdminClient()

  const nombre = formData.get("nombre") as string
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

  const { data: existing } = await supabase
    .from("series")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const añoInicio = formData.get("año_inicio") ? Number(formData.get("año_inicio")) : null
  const añoFin = formData.get("año_fin") ? Number(formData.get("año_fin")) : null
  const orden = formData.get("orden") ? Number(formData.get("orden")) : null

  const { error } = await supabase.from("series").insert({
    slug: finalSlug,
    nombre,
    descripcion: (formData.get("descripcion") as string) || null,
    año_inicio: añoInicio,
    año_fin: añoFin,
    orden,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/colecciones")
  revalidatePath("/series")
  revalidatePath("/")
}

export async function eliminarSerie(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("series").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/colecciones")
  revalidatePath("/series")
  revalidatePath("/")
}
