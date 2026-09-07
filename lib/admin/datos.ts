import { admin } from "./cliente";
import type { Obra, Serie, Categoria } from "@/lib/tipos";
import type { Proyecto } from "@/lib/proyectos";
import { t } from "@/lib/i18n";
import { PREFIJO, aplanar } from "@/lib/textos";
import { SECCIONES, etiquetaDe, huecosDe } from "./catalogo-textos";

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
  sinAnio?: boolean;
  sinFicha?: boolean;
  soloDestacadas?: boolean;
} = {}): Promise<ObraAdmin[]> {
  let q = admin().from("obras").select(OBRAS_ADMIN).order("orden").order("creado_at", { ascending: false });
  if (filtros.q) q = q.ilike("titulo", `%${filtros.q}%`);
  if (filtros.categoria && filtros.categoria !== "sin") q = q.eq("categoria", filtros.categoria);
  if (filtros.categoria === "sin") q = q.or(`categoria.is.null,categoria.in.("")`);
  if (filtros.soloOcultas) q = q.eq("publicada", false);
  if (filtros.soloEncargos) q = q.eq("es_encargo", true);
  if (filtros.sinTitulo) q = q.or("titulo.is.null,titulo.eq.\"\"");
  if (filtros.sinAnio) q = q.is("anio", null);
  if (filtros.sinFicha) q = q.or("tecnica.is.null,ancho_cm.is.null,alto_cm.is.null");
  if (filtros.soloDestacadas) q = q.eq("destacada", true);
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

export type CampoTexto = {
  /** `statement` para los bloques largos, `ui.home.ver` para el resto. */
  clave: string;
  etiqueta: string;
  /** Lo que sale si el campo queda vacio: el texto del codigo. */
  porDefecto: { es: string; en: string };
  es: string;
  en: string;
  huecos: string[];
};

export type GrupoTexto = {
  id: string;
  titulo: string;
  nota?: string;
  campos: CampoTexto[];
};

/**
 * Todo lo escribible del sitio, en grupos que siguen el recorrido de la pagina.
 *
 * Son dos familias distintas con la misma tabla detras. Los bloques largos
 * (biografia, statement, sinopsis) no existen en el codigo: si estan vacios, en
 * el sitio no hay nada que mostrar. El resto son frases que el codigo ya trae
 * escritas y la tabla solo pisa, asi que vaciar el campo no borra: devuelve el
 * texto original.
 */
export async function textosAdmin(): Promise<GrupoTexto[]> {
  const { data, error } = await admin().from("textos").select("clave,titulo,contenido");
  if (error) throw error;
  const filas = (data ?? []) as { clave: string; titulo: string | null; contenido: string }[];

  const guardado = new Map(filas.map((f) => [f.clave, f.contenido]));
  const par = (clave: string) => ({
    es: guardado.get(clave) ?? "",
    en: guardado.get(`${clave}.en`) ?? "",
  });

  const largos = filas
    .filter((f) => !f.clave.endsWith(".en") && !f.clave.startsWith(PREFIJO))
    .sort((a, b) => a.clave.localeCompare(b.clave, "es"))
    .map<CampoTexto>((f) => ({
      clave: f.clave,
      etiqueta: f.titulo ?? f.clave,
      porDefecto: { es: "", en: "" },
      huecos: [],
      ...par(f.clave),
    }));

  const porDefectoEs = aplanar(t("es"));
  const porDefectoEn = aplanar(t("en"));

  const grupos = SECCIONES.map<GrupoTexto>(({ id, titulo, nota }) => ({
    id,
    titulo,
    nota,
    campos: Object.keys(porDefectoEs)
      .filter((ruta) => ruta.startsWith(`${id}.`))
      .map<CampoTexto>((ruta) => ({
        clave: `${PREFIJO}${ruta}`,
        etiqueta: etiquetaDe(ruta),
        porDefecto: { es: porDefectoEs[ruta], en: porDefectoEn[ruta] },
        huecos: huecosDe(porDefectoEs[ruta]),
        ...par(`${PREFIJO}${ruta}`),
      })),
  }));

  return [
    {
      id: "bloques",
      titulo: "Bloques largos",
      nota: "Los textos que no viven en el código: si quedan vacíos, el sitio no muestra nada en su lugar.",
      campos: largos,
    },
    ...grupos,
  ];
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
  // Los contadores de "sin categoria" y "sin titulo" que habia aca marcaban
  // cero por construccion: las dos columnas son NOT NULL y categoria ademas
  // tiene check constraint, asi que la condicion no puede darse nunca. Un
  // control de calidad que no puede fallar es peor que no tenerlo: da por
  // revisado algo que nadie miro. Estos tres si tienen huecos reales.
  const [publicadas, sinAnio, sinFicha, destacadas, sinLeer, leads] = await Promise.all([
    contar(db.from("obras").select("id", { count: "exact", head: true }).eq("publicada", true)),
    contar(db.from("obras").select("id", { count: "exact", head: true }).is("anio", null)),
    contar(db.from("obras").select("id", { count: "exact", head: true }).or("tecnica.is.null,ancho_cm.is.null,alto_cm.is.null")),
    contar(db.from("obras").select("id", { count: "exact", head: true }).eq("destacada", true)),
    contar(db.from("consultas").select("id", { count: "exact", head: true }).eq("leida", false)),
    contar(db.from("libro_leads").select("id", { count: "exact", head: true })),
  ]);
  return { publicadas, sinAnio, sinFicha, destacadas, sinLeer, leads };
}
