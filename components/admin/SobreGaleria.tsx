"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarMedia,
  borrarMedia,
  crearFoto,
  crearVideo,
  firmarFotoExistente,
  firmarFotoNueva,
  guardarImagenFoto,
} from "@/lib/admin/acciones-sobre";
import { esHeic, procesarImagen, subirImagenesFirmadas } from "@/lib/imagen-navegador";
import { embedUrl } from "@/lib/embed";
import type { SobreMediaAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, entrada } from "@/components/admin/ui";
import { url } from "@/lib/media";

export function SobreGaleria({ items }: { items: SobreMediaAdmin[] }) {
  const router = useRouter();
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [epigrafeFoto, setEpigrafeFoto] = useState("");
  const [urlVideo, setUrlVideo] = useState("");
  const [epigrafeVideo, setEpigrafeVideo] = useState("");

  async function agregarFoto(f: File | null) {
    setError(null);
    setEstado(null);
    if (!f) return;
    if (esHeic(f)) {
      setError("Ese archivo es HEIC y el navegador no lo decodifica. Convertilo a JPEG/PNG.");
      return;
    }
    try {
      setEstado("Redimensionando…");
      const lista = await procesarImagen(f);
      setEstado("Pidiendo la subida…");
      const { base, firmas } = await firmarFotoNueva();
      const porSufijo = Object.fromEntries(firmas.map((x) => [x.sufijo, x.token]));
      setEstado("Subiendo…");
      await subirImagenesFirmadas(base, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });
      await crearFoto({ base, imagen_w: lista.w, imagen_h: lista.h, blur: lista.blur, epigrafe: epigrafeFoto });
      setEpigrafeFoto("");
      setEstado(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar la foto.");
      setEstado(null);
    }
  }

  async function agregarVideo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!urlVideo.trim()) return setError("Pega el link del video.");
    try {
      await crearVideo({ video_url: urlVideo, epigrafe: epigrafeVideo });
      setUrlVideo("");
      setEpigrafeVideo("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar el video.");
    }
  }

  return (
    <div className="mt-8">
      <h2 className="titular text-lg">Fotos y videos</h2>
      <p className="mt-1 max-w-prose text-sm text-tinta-media">
        Aparecen en la página pública en el orden que ponés abajo. Marcá &ldquo;Publicada&rdquo; recién cuando quede lista.
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="grid gap-3 border border-linea p-4">
          <p className="etiqueta text-tinta-media">Agregar foto (JPEG, PNG o WebP)</p>
          <textarea
            value={epigrafeFoto}
            onChange={(e) => setEpigrafeFoto(e.target.value)}
            placeholder="Epígrafe (opcional)…"
            rows={2}
            className={entrada}
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => agregarFoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-linea file:bg-papel file:px-3 file:py-2 file:text-sm hover:file:border-tinta-media"
          />
          <p className="text-xs text-tinta-suave">Las fotos HEIC (iPhone) no entran por el navegador.</p>
        </div>

        <form onSubmit={agregarVideo} className="grid gap-3 border border-linea p-4">
          <p className="etiqueta text-tinta-media">Agregar video (link de YouTube o Vimeo)</p>
          <input
            value={urlVideo}
            onChange={(e) => setUrlVideo(e.target.value)}
            placeholder="https://youtube.com/watch?v=… o https://vimeo.com/…"
            className={entrada}
          />
          <textarea
            value={epigrafeVideo}
            onChange={(e) => setEpigrafeVideo(e.target.value)}
            placeholder="Epígrafe (opcional)…"
            rows={2}
            className={entrada}
          />
          <Boton type="submit" variante="borde" className="w-fit">
            Agregar video
          </Boton>
        </form>
      </div>

      {(estado || error) && (
        <div className="mt-4">
          {estado && <p className="text-sm text-tinta-media">{estado}</p>}
          {error && <Aviso tipo="error">{error}</Aviso>}
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-tinta-media">Todavía sin fotos ni videos.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {items.map((m) => (
            <FilaMedia key={m.id} item={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilaMedia({ item }: { item: SobreMediaAdmin }) {
  const router = useRouter();
  const inputArchivo = useRef<HTMLInputElement | null>(null);
  const [epigrafe, setEpigrafe] = useState(item.epigrafe ?? "");
  const [orden, setOrden] = useState(String(item.orden));
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function correr(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  function guardarTexto() {
    correr(() => actualizarMedia(item.id, { epigrafe }));
  }

  function alternarPublicada() {
    correr(() => actualizarMedia(item.id, { publicada: !item.publicada }));
  }

  function guardarOrden() {
    const n = Number(orden);
    if (!Number.isInteger(n) || n === item.orden) {
      setOrden(String(item.orden));
      return;
    }
    correr(async () => {
      await actualizarMedia(item.id, { orden: n });
      setEstado("Guardado.");
    });
  }

  async function reemplazar(f: File | null) {
    if (!f) return;
    if (esHeic(f)) {
      setError("Ese archivo es HEIC y el navegador no lo decodifica. Convertilo a JPEG/PNG.");
      return;
    }
    setEstado("Reemplazando…");
    try {
      const lista = await procesarImagen(f);
      const { base, firmas } = await firmarFotoExistente(item.id);
      const porSufijo = Object.fromEntries(firmas.map((x) => [x.sufijo, x.token]));
      await subirImagenesFirmadas(base, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });
      await guardarImagenFoto(item.id, { imagen_w: lista.w, imagen_h: lista.h, blur: lista.blur });
      setEstado(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reemplazar.");
      setEstado(null);
    }
  }

  return (
    <article className="border border-linea">
      <figure className="bg-papel-alt">
        {item.tipo === "foto" ? (
          <img src={url(item.imagen!, "md")} alt={item.epigrafe ?? "Foto"} className="w-full object-cover" loading="lazy" />
        ) : (
          <div className="relative aspect-video w-full">
            <iframe
              src={embedUrl(item.video_url ?? "") ?? undefined}
              title={item.epigrafe ?? "Video"}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
            />
          </div>
        )}
      </figure>
      <div className="grid gap-3 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="etiqueta text-tinta-suave">{item.tipo === "foto" ? "Foto" : "Video"}</span>
          <div className="flex items-center gap-2">
            {item.tipo === "foto" && (
              <>
                <Boton onClick={() => inputArchivo.current?.click()} className="!px-2 !py-1 text-xs">
                  Reemplazar
                </Boton>
                <input
                  ref={inputArchivo}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => reemplazar(e.target.files?.[0] ?? null)}
                />
              </>
            )}
            <Boton
              variante="peligro"
              className="!px-2 !py-1 text-xs"
              onClick={() => {
                if (!window.confirm("¿Borrar? No se puede deshacer.")) return;
                correr(() => borrarMedia(item.id));
              }}
            >
              Borrar
            </Boton>
          </div>
        </div>
        <label className="block">
          <span className="etiqueta mb-1 block text-tinta-media">Epígrafe</span>
          <textarea value={epigrafe} onChange={(e) => setEpigrafe(e.target.value)} rows={2} className={entrada} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Boton onClick={guardarTexto} className="!px-2 !py-1 text-xs">Guardar epígrafe</Boton>
          <label className="flex items-center gap-1.5">
            <span className="text-xs text-tinta-media">Orden</span>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              onBlur={guardarOrden}
              className="w-16 rounded border border-linea bg-papel px-1.5 py-0.5 text-xs outline-none focus:border-tinta-media"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={item.publicada} onChange={alternarPublicada} className="h-4 w-4 accent-tinta" />
            <span className="text-xs text-tinta-media">Publicada</span>
          </label>
          {estado && <span className="text-xs text-tinta-media">{estado}</span>}
        </div>
        {error && <Aviso tipo="error">{error}</Aviso>}
      </div>
    </article>
  );
}
