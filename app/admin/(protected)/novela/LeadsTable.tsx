"use client"

type Lead = { id: string; email: string; created_at: string }

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const exportCSV = () => {
    const rows = [
      ["email", "fecha"],
      ...leads.map((l) => [l.email, new Date(l.created_at).toISOString()]),
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `el-aprendiz-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--color-muted)]">
          <span className="text-2xl font-[family-name:var(--font-cormorant)] text-[var(--color-text)]">
            {leads.length}
          </span>{" "}
          {leads.length === 1 ? "email registrado" : "emails registrados"}
        </p>
        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="h-9 px-5 border border-[var(--color-border)] text-[10px] tracking-[0.2em] uppercase text-[var(--color-text)] hover:bg-[var(--color-border)]/50 transition-colors disabled:opacity-40"
        >
          Exportar CSV
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="border border-[var(--color-border)] py-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
            Todavía no hay emails capturados.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between px-5 py-3.5 text-sm"
            >
              <span className="text-[var(--color-text)]">{lead.email}</span>
              <span className="text-xs text-[var(--color-muted)]">
                {formatFecha(lead.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
