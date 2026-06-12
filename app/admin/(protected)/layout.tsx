import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/admin/Sidebar"

export const metadata = { title: "Admin — Santiago Azcuy" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Segunda capa de defensa (CVE-2025-29927 — no depender solo del proxy)
  if (!user) redirect("/admin/login")

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
