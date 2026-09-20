export type Categoria = "figurativo" | "abstracto" | "dibujo";

export type EstadoObra = "disponible" | "vendido" | "no_disponible";
export const ESTADOS_OBRA: EstadoObra[] = ["disponible", "vendido", "no_disponible"];

export type Obra = {
  id: string;
  slug: string;
  titulo: string;
  anio: number | null;
  tecnica: string | null;
  ancho_cm: number | null;
  alto_cm: number | null;
  categoria: Categoria;
  serie_id: string | null;
  es_encargo: boolean;
  destacada: boolean;
  en_carrusel: boolean;
  estado: EstadoObra;
  descripcion: string | null;
  imagen: string;
  imagen_w: number;
  imagen_h: number;
  blur: string | null;
};

export type Serie = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
};

export const CATEGORIAS: Categoria[] = ["figurativo", "abstracto", "dibujo"];

// ------------------------------------------------------------
// Proyectos por encargo. Los valores son las claves que viajan a la base; las
// etiquetas que ve la persona viven en el diccionario (lib/i18n.ts) para poder
// traducirlas y editarlas desde el panel.
// ------------------------------------------------------------
export const TIPOS_ENCARGO = ["pintura", "dibujo", "diseno", "mural", "exposicion", "otro"] as const;
export type TipoEncargo = (typeof TIPOS_ENCARGO)[number];

export const DESTINOS_ENCARGO = [
  "residencia",
  "comercial",
  "institucion",
  "publico",
  "galeria",
  "otro",
] as const;
export type DestinoEncargo = (typeof DESTINOS_ENCARGO)[number];

/** Tope de imagenes de referencia por solicitud. El server lo vuelve a validar. */
export const MAX_ADJUNTOS = 8;

/** "Acrílico · 130 × 80 cm · 2016", saltando lo que falte. La tecnica la
 *  escribio Santiago en castellano y no se traduce: es el dato, no la etiqueta. */
export function ficha(o: Obra): string {
  const medidas =
    o.ancho_cm && o.alto_cm
      ? `${fmt(o.ancho_cm)} × ${fmt(o.alto_cm)} cm`
      : null;
  return [o.tecnica, medidas, o.anio].filter(Boolean).join(" · ");
}

const fmt = (n: number) => String(n).replace(/\.00$/, "").replace(".", ",");
