"use server"

import { createAdminClient } from "@/lib/supabase/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PDF_PATH = "el-aprendiz.pdf"
const SIGNED_URL_TTL = 300 // 5 minutos

type Resultado = { ok: true; url: string } | { ok: false; error: string }

export async function solicitarNovela(_prev: unknown, formData: FormData): Promise<Resultado> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Ingresá un email válido." }
  }

  const supabase = await createAdminClient()

  // Guardar el lead. Si ya existe (unique lower(email)), lo dejamos pasar igual.
  const { error: insertError } = await supabase.from("novela_leads").insert({ email })
  if (insertError && insertError.code !== "23505") {
    console.error("[el-aprendiz] error guardando lead:", insertError)
    return { ok: false, error: "No pudimos registrar tu email. Probá de nuevo." }
  }

  // Generar link firmado temporal para descargar el PDF del bucket privado
  const { data, error: signError } = await supabase.storage
    .from("novela")
    .createSignedUrl(PDF_PATH, SIGNED_URL_TTL, {
      download: "El Aprendiz - Ciudad Intradorada.pdf",
    })

  if (signError || !data?.signedUrl) {
    console.error("[el-aprendiz] error generando signed URL:", signError)
    return { ok: false, error: "No pudimos generar la descarga. Probá de nuevo." }
  }

  return { ok: true, url: data.signedUrl }
}
