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

export const ETIQUETA: Record<Categoria, string> = {
  figurativo: "Figurativo",
  abstracto: "Abstracto",
  dibujo: "Dibujo",
};

/** "Acrílico · 130 × 80 cm · 2016", saltando lo que falte. */
export function ficha(o: Obra): string {
  const medidas =
    o.ancho_cm && o.alto_cm
      ? `${fmt(o.ancho_cm)} × ${fmt(o.alto_cm)} cm`
      : null;
  return [o.tecnica, medidas, o.anio].filter(Boolean).join(" · ");
}

const fmt = (n: number) => String(n).replace(/\.00$/, "").replace(".", ",");
