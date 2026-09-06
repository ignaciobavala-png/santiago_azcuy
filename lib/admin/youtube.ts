/**
 * Resolucion de URLs de YouTube a un videoId, mas los dos datos que la pagina
 * necesita y el id no alcanza a dar: el titulo (oEmbed) y que variante de
 * miniatura existe (HEAD a i.ytimg.com). Todo esto es server-side: el id y la
 * variante se guardan, y el front arma iframe y miniatura a partir de ellos.
 */

const CON_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;

export function idYouTube(crudo: string): string | null {
  const url = crudo.trim();
  const m = url.match(CON_ID);
  if (m) return m[1];
  // Un id pelado tambien es valido: Santiago puede pegar el codigo directo.
  if (/^[\w-]{11}$/.test(url)) return url;
  return null;
}

export async function tituloYouTube(id: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      { next: { revalidate: 0 } }
    );
    if (!r.ok) return null;
    const datos = (await r.json()) as { title?: string };
    return datos.title ?? null;
  } catch {
    return null;
  }
}

/**
 * maxresdefault devuelve 404 en buena parte de los videos, y un 404 dentro de
 * un srcset no degrada: muestra la imagen rota. El HEAD dice cual existe.
 */
export async function miniaturaYouTube(id: string): Promise<"maxresdefault" | "mqdefault"> {
  try {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, {
      method: "HEAD",
      redirect: "follow",
    });
    return r.ok ? "maxresdefault" : "mqdefault";
  } catch {
    return "mqdefault";
  }
}
