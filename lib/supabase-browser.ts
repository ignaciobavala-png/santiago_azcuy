import { createClient } from "@supabase/supabase-js";

/**
 * Cliente publico de Supabase solo para el navegador. El sitio publico no lo
 * usa (toda lectura va por el server con RLS); el panel lo necesita para subir
 * las imagenes directo a Storage con el token firmado que pidio el server, sin
 * que el archivo pase por Vercel.
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);
