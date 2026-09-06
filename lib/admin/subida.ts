import { admin } from "./cliente";

/**
 * Firma subidas y borra archivos de Storage. Lo usa el server del panel: la
 * cookie ya valido la sesion, y con la service key se pide una URL firmada por
 * archivo que despues el navegador usa para subir directo, sin pasar por
 * Vercel. Los paths se arman aca con el prefijo fijo (obras/, proyectos/), no
 * se confia en lo que mande el cliente.
 */

export type Firma = { sufijo: "sm" | "md" | "lg"; path: string; token: string };

export async function firmarTres(base: string, upsert: boolean): Promise<Firma[]> {
  const sb = admin().storage.from("medios");
  const salidas: Firma[] = [];
  for (const sufijo of ["sm", "md", "lg"] as const) {
    const path = `${base}-${sufijo}.webp`;
    const { data, error } = await sb.createSignedUploadUrl(path, { upsert });
    if (error || !data) throw new Error(`No se pudo firmar ${path}: ${error?.message ?? "sin respuesta"}`);
    salidas.push({ sufijo, path, token: data.token });
  }
  return salidas;
}

/** Borra los tres tamanos derivados de una base ("obras/pleyades"). */
export async function borrarTres(base: string): Promise<void> {
  const sb = admin().storage.from("medios");
  const { error } = await sb.remove(["sm", "md", "lg"].map((s) => `${base}-${s}.webp`));
  if (error) throw new Error(`No se pudieron borrar las imagenes de ${base}: ${error.message}`);
}
