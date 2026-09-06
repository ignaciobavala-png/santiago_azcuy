import { timingSafeEqual } from "node:crypto";
import { supabase } from "@/lib/supabase";

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan free pausa un proyecto tras 7 dias sin actividad. El sitio consulta
 * la base en cada revalidacion, pero el ISR solo revalida cuando alguien entra:
 * una semana sin visitas y la base se duerme sola, con lo que la pagina vuelve
 * caida sin que nadie haya tocado nada.
 *
 * Corre a diario, no semanal, por dos razones que estan en la doc de Vercel:
 * la entrega es best effort y puede saltearse invocaciones, y en Hobby el
 * horario se corre dentro de la hora indicada. Diario deja margen para seis
 * fallas seguidas antes de que importe.
 */
export const dynamic = "force-dynamic";

const igual = (a: string, b: string) => {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  const cabecera = req.headers.get("authorization") ?? "";

  // Sin secreto configurado no se abre igual: seria un endpoint publico que
  // cualquiera puede golpear para gastar invocaciones.
  if (!secreto || !igual(cabecera, `Bearer ${secreto}`)) {
    return new Response("No autorizado", { status: 401 });
  }

  // Tiene que ser una consulta de verdad. Devolver {ok:true} sin tocar la base
  // dejaria el cron corriendo prolijo mientras Supabase se duerme igual: lo que
  // cuenta como actividad es la query, no que la funcion responda.
  const inicio = Date.now();
  const { count, error } = await supabase
    .from("obras")
    .select("id", { count: "exact", head: true })
    .eq("publicada", true);

  if (error) {
    console.error("[cron] la base no respondio:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }

  return Response.json({ ok: true, obras: count, ms: Date.now() - inicio });
}
