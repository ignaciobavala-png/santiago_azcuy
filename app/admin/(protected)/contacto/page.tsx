import { getConsultas } from "./actions"
import { ConsultasClient } from "./ConsultasClient"

export const dynamic = "force-dynamic"

const TIPO_LABEL: Record<string, string> = {
  compra: "Adquisición",
  general: "General",
  prensa: "Prensa",
}

export default async function ContactoAdminPage() {
  const consultas = await getConsultas()

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Contacto
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          {consultas.length} consulta{consultas.length === 1 ? "" : "s"} recibida{consultas.length === 1 ? "" : "s"}
        </p>
      </div>

      {consultas.length === 0 ? (
        <div className="border border-[var(--color-border)] p-16 text-center">
          <p className="text-sm text-[var(--color-muted)]">No hay consultas todavía.</p>
        </div>
      ) : (
        <ConsultasClient consultas={consultas} tipoLabel={TIPO_LABEL} />
      )}
    </div>
  )
}
