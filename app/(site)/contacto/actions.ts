"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function enviarConsulta(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const nombre = (formData.get("nombre") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const tipo_consulta = (formData.get("tipo_consulta") as string) || "general"
  const mensaje = (formData.get("mensaje") as string)?.trim()

  if (!nombre || !email || !mensaje) {
    return { ok: false, error: "Completá todos los campos obligatorios." }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { ok: false, error: "El email no es válido." }
  }

  const { error } = await supabase.from("consultas").insert({
    nombre,
    email,
    tipo_consulta,
    mensaje,
    leido: false,
  })

  if (error) {
    return { ok: false, error: "Hubo un error al enviar. Intentá de nuevo." }
  }

  revalidatePath("/admin/contacto")
  return { ok: true }
}
