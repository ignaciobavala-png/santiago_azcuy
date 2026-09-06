import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service key, solo para el server del panel. Las policies de RLS
 * dan escritura al rol authenticated, y en el panel no hay usuario de Supabase
 * Auth: la identidad es la cookie firmada de ADMIN_SECRET. Toda escritura pasa
 * por aca, con la service key que nunca llega al navegador.
 */
export const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
