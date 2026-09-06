import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service key: SOLO para el server. El texto de la novela no tiene
 * policy de lectura para anon, asi que esta es la unica via de acceso. Si se
 * expusiera por la API publica, el "dejá tu mail" no filtraria nada: bastaria
 * con pegarle directo al endpoint de Supabase.
 */
const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

export type Capitulo = {
  numero: number | null;
  titulo: string;
  contenido: string;
  palabras: number;
  orden: number;
};

/** Solo lo necesario para el indice: no baja las 439 KB de texto. */
export async function indice() {
  const { data } = await admin()
    .from("libro_capitulos")
    .select("numero,titulo,palabras,orden")
    .order("orden");
  return (data ?? []) as Omit<Capitulo, "contenido">[];
}

export async function capitulos(): Promise<Capitulo[]> {
  const { data } = await admin()
    .from("libro_capitulos")
    .select("numero,titulo,contenido,palabras,orden")
    .order("orden");
  return (data ?? []) as Capitulo[];
}

/**
 * El email llega ya normalizado a minusculas desde la route, que es lo que
 * hace que el unique sobre la columna alcance.
 */
export async function registrarLead(email: string) {
  const { error } = await admin()
    .from("libro_leads")
    .upsert({ email }, { onConflict: "email" });
  if (error) throw error;
}
