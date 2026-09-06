import { admin } from "./cliente";
import type { Obra, Serie, Categoria } from "@/lib/tipos";
import type { Proyecto } from "@/lib/proyectos";

/**
 * Lecturas del panel. Usan el cliente con service key a proposito: las paginas
 * publicas leen con RLS y solo ven lo publicado, pero el admin tiene que ver
 * las no publicadas, las ocultas y las consultas (que no tienen policy de
 * lectura para anon). Todo lo que aca se lee, la cookie ya lo habilito.
 */

const OBRAS_ADMIN =
  "id,slug,titulo,anio,tecnica,ancho_cm,alto_cm,categoria,serie_id,es_encargo,destacada,disponible,publicada,descripcion,imagen,imagen_w,imagen_h,blur,orden";

export type ObraAdmin = Obra & { publicada: boolean; orden: number };

export async function obrasAdmin(filtros: {
  q?: string;
  categoria?: Categoria | "sin";
  soloOcultas?: boolean;
  soloEncargos?: boolean;
  sinTitulo?: boolean;
} = {}): Promise<ObraAdmin[]> {
  let q = admin().from("obras").select(OBRAS_ADMIN).order("orden").order("creado_at", { ascending: false });
  if (filtros.q) q = q.ilike("titulo", `%${filtros.q}%`);
  if (filtros.categoria && filtros.categoria !== "sin") q = q.eq("categoria", filtros.categoria);
  if (filtros.categoria === "sin") q = q.or(`categoria.is.null,categoria.in.("")`);
  if (filtros.soloOcultas) q = q.eq("publicada", false);
  if (filtros.soloEncargos) q = q.eq("es_encargo", true);
  if (filtros.sinTitulo) q = q.or("titulo.is.null,titulo.eq.\"\"");
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ObraAdmin[];
}

export async function obraAdmin(id: string): Promise<ObraAdmin | null> {
  const { data, error } = await admin()
    .from("obras")
    .select(OBRAS_ADMIN)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ObraAdmin) ?? null;
}

export async function seriesAdmin(): Promise<Serie[]> {
  const { data, error } = await admin().from("series").select("id,slug,nombre,descripcion,orden").order("orden");
  if (error) throw error;
  return (data ?? []) as Serie[];
}

export type TextoAdmin = {
  clave: string;
  titulo: string | null;
  es: string;
  en: string;
};

/** Las claves base con su traduccion al lado, aunque la fila `.en` no exista. */
export async function textosAdmin(): Promise<TextoAdmin[]> {
  const { data, error } = await admin().from("textos").select("clave,titulo,contenido");
  if (error) throw error;
  const filas = (data ?? []) as { clave: string; titulo: string | null; contenido: string }[];
  const es = filas.filter((f) => !f.clave.endsWith(".en"));
  const en = new Map(filas.filter((f) => f.clave.endsWith(".en")).map((f) => [f.clave, f.contenido]));
  return es
    .map((f) => ({ clave: f.clave, titulo: f.titulo, es: f.contenido, en: en.get(`${f.clave}.en`) ?? "" }))
    .sort((a, b) => a.clave.localeCompare(b.clave, "es"));
}

const MUSICA_ADMIN =
  "id,tipo,titulo,recurso,plataforma,duracion,descripcion,miniatura,anio,visible,orden";

export type PistaAdmin = {
  id: string;
  tipo: "album" | "clip" | "tema" | "entrevista";
  titulo: string;
  recurso: string;
  plataforma: string | null;
  duracion: string | null;
  descripcion: string | null;
  miniatura: string;
  anio: number | null;
  visible: boolean;
  orden: number;
};

export async function musicaAdmin(): Promise<PistaAdmin[]> {
  const { data, error } = await admin().from("musica").select(MUSICA_ADMIN).order("orden").order("creado_at");
  if (error) throw error;
  return (data ?? []) as PistaAdmin[];
}

export async function pistaAdmin(id: string): Promise<PistaAdmin | null> {
  const { data, error } = await admin().from("musica").select(MUSICA_ADMIN).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as PistaAdmin) ?? null;
}

export type LaminaAdmin = {
  id: string;
  imagen: string;
  imagen_w: number;
  imagen_h: number;
  blur: string | null;
  epigrafe: string | null;
  orden: number;
};

export type ProyectoAdmin = Proyecto & { publicado: boolean; orden: number; laminas: LaminaAdmin[] };

export async function proyectosAdmin(): Promise<Omit<ProyectoAdmin, "laminas">[]> {
  const { data, error } = await admin()
    .from("proyectos")
    .select("id,slug,titulo,ubicacion,anio,estado,descripcion,publicado,orden")
    .order("orden")
    .order("creado_at");
  if (error) throw error;
  return (data ?? []) as Omit<ProyectoAdmin, "laminas">[];
}

export async function proyectoAdmin(id: string): Promise<ProyectoAdmin | null> {
  const { data, error } = await admin()
    .from("proyectos")
    .select(
      "id,slug,titulo,ubicacion,anio,estado,descripcion,publicado,orden,proyecto_imagenes(id,imagen,imagen_w,imagen_h,blur,epigrafe,orden)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { proyecto_imagenes, ...p } = data as Omit<ProyectoAdmin, "laminas"> & {
    proyecto_imagenes: LaminaAdmin[];
  };
  return { ...p, laminas: [...proyecto_imagenes].sort((a, b) => a.orden - b.orden) };
}

export type ConsultaAdmin = {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  obra_id: string | null;
  obra_titulo: string | null;
  leida: boolean;
  creado_at: string;
};

export async function consultasAdmin(): Promise<ConsultaAdmin[]> {
  const { data, error } = await admin()
    .from("consultas")
    .select("id,nombre,email,mensaje,obra_id,leida,creado_at,obras(titulo)")
    .order("creado_at", { ascending: false });
  if (error) throw error;
  const lista = (data ?? []) as unknown as (Omit<ConsultaAdmin, "obra_titulo"> & {
    obras: { titulo: string } | { titulo: string }[] | null;
  })[];
  return lista.map(({ obras, ...c }) => {
    const fila = Array.isArray(obras) ? obras[0] : obras;
    return { ...c, obra_titulo: fila?.titulo ?? null };
  });
}

export async function leadsAdmin() {
  const { data, error } = await admin()
    .from("libro_leads")
    .select("email,creado_at")
    .order("creado_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as { email: string; creado_at: string }[];
}

export async function capitulosAdmin() {
  const { data, error } = await admin()
    .from("libro_capitulos")
    .select("id,numero,titulo,palabras,orden")
    .order("orden");
  if (error) throw error;
  return (data ?? []) as { id: string; numero: number | null; titulo: string; palabras: number; orden: number }[];
}

export async function tableroAdmin() {
  const contar = (consulta: PromiseLike<{ count: number | null }>) =>
    consulta.then((r) => r.count ?? 0);

  const db = admin();
  const [publicadas, sinCategoria, sinTitulo, sinLeer, leads] = await Promise.all([
    contar(db.from("obras").select("id", { count: "exact", head: true }).eq("publicada", true)),
    contar(db.from("obras").select("id", { count: "exact", head: true }).or(`categoria.is.null,categoria.in.("")`)),
    contar(db.from("obras").select("id", { count: "exact", head: true }).or("titulo.is.null,titulo.eq.\"\"")),
    contar(db.from("consultas").select("id", { count: "exact", head: true }).eq("leida", false)),
    contar(db.from("libro_leads").select("id", { count: "exact", head: true })),
  ]);
  return { publicadas, sinCategoria, sinTitulo, sinLeer, leads };
}
