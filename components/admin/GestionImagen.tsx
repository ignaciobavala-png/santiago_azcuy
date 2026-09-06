"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  borrarObra,
  firmarSubidaObraExistente,
  guardarImagenObra,
} from "@/lib/admin/acciones-obras";
import { esHeic, procesarImagen, subirImagenesFirmadas } from "@/lib/imagen-navegador";
import { Aviso, Boton } from "@/components/admin/ui";
import { url } from "@/lib/media";

/**
 * Zona de imagen de la ficha de obra: reemplazar los tres tamanos (upsert
 * sobre los mismos paths) y borrar la obra entera con sus archivos. Borrar
 * pide confirmacion: es irreversible y toca Storage ademas de la fila.
 */
export function GestionImagen({ obraId, imagen, titulo }: { obraId: string; imagen: string; titulo: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function reemplazar(f: File | null) {
    setError(null);
    setOk(false);
    if (!f) return;
    if (esHeic(f)) {
      setError("Ese archivo es HEIC y el navegador no lo decodifica. Convertilo a JPEG/PNG o usá el script local.");
      return;
    }
    setEstado("Redimensionando…");
    try {
      const lista = await procesarImagen(f);
      setEstado("Subiendo a Supabase…");
      const firmas = await firmarSubidaObraExistente(obraId);
      const porSufijo = Object.fromEntries(firmas.map((x) => [x.sufijo, x.token]));
      await subirImagenesFirmadas(imagen, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });
      setEstado("Guardando…");
      await guardarImagenObra(obraId, { imagen_w: lista.w, imagen_h: lista.h, blur: lista.blur });
      setEstado(null);
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reemplazar la imagen.");
      setEstado(null);
    }
  }

  async function borrar() {
    if (!window.confirm(`¿Borrar la obra «${titulo}»? Se borran también sus tres archivos del storage. No se puede deshacer.`)) return;
    try {
      await borrarObra(obraId);
      router.replace("/admin/obras?ok=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar.");
    }
  }

  return (
    <div className="grid gap-6 border border-linea p-5 md:grid-cols-2">
      <figure className="bg-papel-alt">
        <img src={url(imagen, "md")} alt={titulo} className="w-full object-cover" />
        <figcaption className="etiqueta px-2 py-2 text-tinta-suave">Vista actual (-md)</figcaption>
      </figure>

      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="etiqueta text-tinta-media">Reemplazar imagen</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => reemplazar(e.target.files?.[0] ?? null)}
            className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-linea file:bg-papel file:px-3 file:py-2 file:text-sm hover:file:border-tinta-media"
          />
          <p className="mt-1 text-xs text-tinta-suave">Sobre-escribe los tres tamaños. Las fotos HEIC van por el script local.</p>
        </div>
        <div className="space-y-2">
          {estado && <Aviso tipo="neutro">{estado}</Aviso>}
          {error && <Aviso tipo="error">{error}</Aviso>}
          {ok && <Aviso tipo="ok">Imagen reemplazada.</Aviso>}
          <Boton variante="peligro" onClick={borrar} className="w-full">
            Borrar obra
          </Boton>
        </div>
      </div>
    </div>
  );
}
