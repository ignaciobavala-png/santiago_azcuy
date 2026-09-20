/**
 * URL de YouTube o Vimeo pegada por Santiago -> src de iframe embebible. No se
 * guarda el embed resuelto: se recalcula en cada render, asi que un cambio
 * aca no exige recorrer filas viejas.
 */
export function embedUrl(cruda: string): string | null {
  const url = cruda.trim();

  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}
