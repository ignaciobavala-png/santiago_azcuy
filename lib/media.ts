const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medios`;

/**
 * La DB guarda solo el path base ("obras/ashtar-sheran"). Los tres tamanos se
 * derivan por sufijo, asi que no hay tres columnas que se puedan desincronizar.
 *
 * Las imagenes ya vienen optimizadas de la ingesta: se sirven con <img srcset>
 * plano en vez de next/image, para no gastar transformaciones de Vercel ni
 * depender de su cuota.
 */
export const url = (imagen: string, tam: "sm" | "md" | "lg" = "md") =>
  `${BASE}/${imagen}-${tam}.webp`;

export const srcSet = (imagen: string) =>
  [
    `${url(imagen, "sm")} 400w`,
    `${url(imagen, "md")} 900w`,
    `${url(imagen, "lg")} 1800w`,
  ].join(", ");
