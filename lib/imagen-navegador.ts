import { supabaseBrowser } from "./supabase-browser";

/**
 * Pipeline de imagenes del panel. En la ingesta esto lo hace ImageMagick
 * local, que en Vercel no existe; aca el navegador redimensiona con <canvas>
 * a WebP en tres tamanos y el server solo firma la subida. El archivo nunca
 * toca Vercel, asi que no gasta el limite de 4,5 MB por request ni tiempo de
 * funcion: va directo a Supabase Storage.
 */

export const TAMANOS = [
  { sufijo: "sm", lado: 400, calidad: 0.72 },
  { sufijo: "md", lado: 900, calidad: 0.78 },
  { sufijo: "lg", lado: 1800, calidad: 0.8 },
] as const;

/** El navegador no decodifica HEIC (Chrome no; Safari si). */
export function esHeic(file: File): boolean {
  return /image\/heic|image\/heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function decodificar(file: File): Promise<HTMLCanvasElement> {
  // createImageBitmap respeta la orientacion EXIF; es el camino moderno.
  try {
    const mapa = await createImageBitmap(file);
    const c = document.createElement("canvas");
    c.width = mapa.width;
    c.height = mapa.height;
    c.getContext("2d")!.drawImage(mapa, 0, 0);
    mapa.close();
    return c;
  } catch {
    // Safari viejo: caer al <img> clasico.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("El archivo no se puede leer como imagen."));
        img.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      return c;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function webpBlob(canvas: HTMLCanvasElement, calidad: number): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Este navegador no puede generar WebP."))),
      "image/webp",
      calidad
    );
  });
}

export type ImagenLista = {
  sm: Blob;
  md: Blob;
  lg: Blob;
  /** Dimensiones del lg ya redimensionado: alimentan el aspect-ratio. */
  w: number;
  h: number;
  blur: string;
};

/**
 * Redimensiona a los tres tamanos (solo achicando, nunca agrandando) y genera
 * el placeholder de 20 px como data URI. Devuelve tambien un JPEG sin
 * redimensionar no: solo lo que la columna `blur` espera.
 */
export async function procesarImagen(file: File): Promise<ImagenLista> {
  const original = await decodificar(file);

  const encuadrar = (lado: number) => {
    const factor = Math.min(1, lado / Math.max(original.width, original.height));
    const w = Math.max(1, Math.round(original.width * factor));
    const h = Math.max(1, Math.round(original.height * factor));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d")!.drawImage(original, 0, 0, w, h);
    return c;
  };

  const [smC, mdC, lgC] = [encuadrar(TAMANOS[0].lado), encuadrar(TAMANOS[1].lado), encuadrar(TAMANOS[2].lado)];
  const [sm, md, lg] = await Promise.all([
    webpBlob(smC, TAMANOS[0].calidad),
    webpBlob(mdC, TAMANOS[1].calidad),
    webpBlob(lgC, TAMANOS[2].calidad),
  ]);

  // Placeholder: el mismo encuadre a 20 px de lado maximo, calidad baja.
  const f = Math.min(1, 20 / Math.max(original.width, original.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(original.width * f));
  c.height = Math.max(1, Math.round(original.height * f));
  c.getContext("2d")!.drawImage(original, 0, 0, c.width, c.height);
  const blur = c.toDataURL("image/webp", 0.6);

  return { sm, md, lg, w: lgC.width, h: lgC.height, blur };
}

/**
 * Sube cada blob a la URL firmada que pidio el server. `base` es el path sin
 * sufijo ("obras/pleyades"); los tres archivos se derivan igual que en la
 * ingesta. `tokens` mapea sufijo -> token firmado.
 */
export async function subirImagenesFirmadas(
  base: string,
  lista: ImagenLista,
  tokens: { sm: string; md: string; lg: string }
) {
  const sb = supabaseBrowser.storage.from("medios");
  const pares: [string, string, Blob][] = [
    ["sm", tokens.sm, lista.sm],
    ["md", tokens.md, lista.md],
    ["lg", tokens.lg, lista.lg],
  ];
  for (const [sufijo, token, blob] of pares) {
    const { error } = await sb.uploadToSignedUrl(`${base}-${sufijo}.webp`, token, blob, {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
    });
    if (error) throw new Error(`No se pudo subir ${base}-${sufijo}.webp: ${error.message}`);
  }
}
