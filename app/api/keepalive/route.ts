import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// Llamado por el cron de Vercel — mantiene activa la BD de Supabase
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createAdminClient()
    const { error } = await supabase.from("series").select("id").limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
