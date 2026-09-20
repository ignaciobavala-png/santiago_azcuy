import { NextResponse } from "next/server";
import { admin } from "@/lib/admin/cliente";
import { MAX_ADJUNTOS } from "@/lib/tipos";

export const runtime = "nodejs";

/**
 * Firma la subida de los adjuntos de un encargo. El archivo nunca pasa por
 * Vercel: el navegador lo comprime y lo manda directo a Supabase con la URL
 * firmada. Aca solo se arma el path —con el prefijo fijo del bucket privado,
 * nunca con lo que mande el cliente— y se devuelve el token.
 */
export async function POST(req: Request) {
  const cuerpo = await req.json().catch(() => null);
  const archivos = Array.isArray(cuerpo?.archivos) ? cuerpo.archivos : [];

  if (archivos.length === 0) return NextResponse.json({ subidas: [] });
  if (archivos.length > MAX_ADJUNTOS) {
    return NextResponse.json(
      { error: `Se pueden adjuntar hasta ${MAX_ADJUNTOS} imágenes.` },
      { status: 400 }
    );
  }

  const lote = crypto.randomUUID();
  const bucket = admin().storage.from("encargos");

  try {
    const subidas = [];
    for (let i = 0; i < archivos.length; i++) {
      const path = `encargos/${lote}/${i + 1}.webp`;
      const { data, error } = await bucket.createSignedUploadUrl(path, { upsert: false });
      if (error || !data) {
        throw new Error(error?.message ?? "sin respuesta al firmar");
      }
      subidas.push({ path, token: data.token });
    }
    return NextResponse.json({ subidas });
  } catch (e) {
    console.error("[encargos] no se pudieron firmar las subidas:", e);
    return NextResponse.json(
      { error: "No se pudieron preparar los adjuntos. Probá de nuevo." },
      { status: 500 }
    );
  }
}
