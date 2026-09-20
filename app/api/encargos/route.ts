import { NextResponse } from "next/server";
import { admin } from "@/lib/admin/cliente";
import { DESTINOS_ENCARGO, MAX_ADJUNTOS, TIPOS_ENCARGO } from "@/lib/tipos";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const TEXTOS = {
  es: {
    requerido: "Faltan datos obligatorios.",
    mail: "Escribí un mail válido.",
    adjuntos: `Se pueden adjuntar hasta ${MAX_ADJUNTOS} imágenes.`,
    guardar: "No se pudo enviar la solicitud. Probá de nuevo en un momento.",
  },
  en: {
    requerido: "Some required fields are missing.",
    mail: "Please enter a valid email.",
    adjuntos: `You can attach up to ${MAX_ADJUNTOS} images.`,
    guardar: "We couldn't send your request. Please try again shortly.",
  },
} as const;

const txt = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const opcional = (v: unknown, max: number) => txt(v, max) || null;

type Adjunto = { path: string; nombre: string | null; bytes: number | null; tipo: string | null };

/** Valida los paths que devolvio /api/encargos/firma: prefijo fijo y sin saltos. */
function adjuntosValidos(crudos: unknown): { lista: Adjunto[]; error: boolean } {
  if (crudos === undefined || crudos === null) return { lista: [], error: false };
  if (!Array.isArray(crudos)) return { lista: [], error: true };
  if (crudos.length > MAX_ADJUNTOS) return { lista: [], error: true };

  const lista: Adjunto[] = [];
  for (const a of crudos) {
    const path = txt((a as { path?: unknown })?.path, 300);
    if (!path.startsWith("encargos/") || path.includes("..")) return { lista: [], error: true };
    const bytes = Number((a as { bytes?: unknown })?.bytes);
    lista.push({
      path,
      nombre: opcional((a as { nombre?: unknown })?.nombre, 200),
      bytes: Number.isFinite(bytes) && bytes > 0 ? Math.round(bytes) : null,
      tipo: opcional((a as { tipo?: unknown })?.tipo, 80),
    });
  }
  return { lista, error: false };
}

/**
 * Alta de una solicitud de Proyectos por Encargo.
 *
 * Va por route handler y no por insert directo del navegador por dos razones:
 * valida del lado del server (los tipos de proyecto y destino, los topes) y
 * puede hacer rollback. Si el insert de la fila falla despues de que el
 * navegador ya subio los adjuntos, borra esos archivos: si no, quedan huérfanos
 * en el bucket privado sin ninguna fila que los referencie.
 */
export async function POST(req: Request) {
  const cuerpo = await req.json().catch(() => null);
  const lang: "es" | "en" = cuerpo?.lang === "en" ? "en" : "es";
  const t = TEXTOS[lang];

  if (!cuerpo || typeof cuerpo !== "object") {
    return NextResponse.json({ error: t.requerido }, { status: 400 });
  }

  // Trampa para bots: un humano no ve ni completa este campo.
  if (txt(cuerpo.website, 100)) return NextResponse.json({ ok: true });

  const nombre = txt(cuerpo.nombre, 120);
  const email = txt(cuerpo.email, 160).toLowerCase();
  const descripcion = txt(cuerpo.descripcion, 8000);
  const tipoProyecto = txt(cuerpo.tipoProyecto, 40);
  const destino = txt(cuerpo.destino, 40);

  if (!nombre || !descripcion || !tipoProyecto || !destino) {
    return NextResponse.json({ error: t.requerido }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: t.mail }, { status: 400 });
  }
  if (!(TIPOS_ENCARGO as readonly string[]).includes(tipoProyecto)) {
    return NextResponse.json({ error: t.requerido }, { status: 400 });
  }
  if (!(DESTINOS_ENCARGO as readonly string[]).includes(destino)) {
    return NextResponse.json({ error: t.requerido }, { status: 400 });
  }

  const { lista: adjuntos, error: malAdjuntos } = adjuntosValidos(cuerpo.archivos);
  if (malAdjuntos) return NextResponse.json({ error: t.adjuntos }, { status: 400 });

  const db = admin();
  const paths = adjuntos.map((a) => a.path);

  try {
    const { data, error } = await db
      .from("consultas")
      .insert({
        clase: "encargo",
        nombre,
        email,
        mensaje: descripcion,
        whatsapp: opcional(cuerpo.whatsapp, 40),
        ciudad: opcional(cuerpo.ciudad, 120),
        pais: opcional(cuerpo.pais, 120),
        tipo_proyecto: tipoProyecto,
        tipo_otro: opcional(cuerpo.tipoOtro, 160),
        destino,
        destino_otro: opcional(cuerpo.destinoOtro, 160),
        referencias: opcional(cuerpo.referencias, 2000),
      })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "sin id");

    if (adjuntos.length > 0) {
      const { error: errorArchivos } = await db
        .from("consulta_archivos")
        .insert(adjuntos.map((a) => ({ ...a, consulta_id: data.id })));
      if (errorArchivos) throw new Error(errorArchivos.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[encargos] no se pudo guardar la solicitud:", e);
    // Rollback: los adjuntos ya subidos no deben quedar sin su fila.
    if (paths.length > 0) {
      const { error } = await db.storage.from("encargos").remove(paths);
      if (error) console.error("[encargos] tampoco se pudieron borrar los adjuntos:", error.message);
    }
    return NextResponse.json({ error: t.guardar }, { status: 500 });
  }
}
