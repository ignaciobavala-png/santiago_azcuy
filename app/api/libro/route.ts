import { NextResponse } from "next/server";
import { registrarLead } from "@/lib/libro";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Registra el mail y devuelve la cookie que habilita /libro/leer. El texto
 * viaja recien en esa pagina, renderizada en el server: nunca se manda la
 * novela entera a alguien que no paso por aca.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: "" }));

  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return NextResponse.json({ error: "Escribí un mail válido." }, { status: 400 });
  }

  try {
    await registrarLead(email.trim().toLowerCase());
  } catch (e) {
    // Si la escritura falla igual se deja leer: perder un lead es preferible a
    // dejar afuera a alguien que quiere el libro. Pero se registra en el log,
    // porque un catch mudo aca ya escondio una vez un upsert roto.
    console.error("[libro] no se pudo guardar el lead:", e);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("libro", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
