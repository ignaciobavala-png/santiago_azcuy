export type Categoria = "figurativo" | "abstracto" | "dibujo";

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
  disponible: boolean;
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
};

export const CATEGORIAS: Categoria[] = ["figurativo", "abstracto", "dibujo"];

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
