import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de lectura publica. Usa la publishable key, asi que solo ve lo que
 * RLS deja ver: obras publicadas, textos, musica visible y proyectos
 * publicados. No hay forma de que una pagina publica lea de mas.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);
