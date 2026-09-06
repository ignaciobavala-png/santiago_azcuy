import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin/sesion";
import { leadsAdmin } from "@/lib/admin/datos";

/**
 * Exporta los mails del libro como CSV. Es un GET (el navegador descarga), asi
 * que la guarda la repite la cookie en vez de una Server Action. Con separador
 * de punto y coma y BOM para que Excel es-AR abra bien.
 */
export async function GET() {
  await exigirAdmin();
  const leads = await leadsAdmin();
  const cuerpo =
    "\uFEFFemail;creado_at\n" +
    leads.map((l) => `${l.email};${l.creado_at}`).join("\n");

  return new NextResponse(cuerpo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-libro-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
