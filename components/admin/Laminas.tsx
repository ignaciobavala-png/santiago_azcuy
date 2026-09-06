"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarLamina,
  borrarLamina,
  crearLamina,
  firmarLaminaExistente,
  firmarLaminaNueva,
  guardarImagenLamina,
} from "@/lib/admin/acciones-arquitectura";
import { esHeic, procesarImagen, subirImagenesFirmadas } from "@/lib/imagen-navegador";
import type { LaminaAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, entrada } from "@/components/admin/ui";
import { url } from "@/lib/media";

export function Laminas({
  proyectoId,
  laminas,
}: {
  proyectoId: string;
  laminas: LaminaAdmin[];
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [epigrafeNueva, setEpigrafeNueva] = useState("");

  async function agregar(f: File | null) {
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
      const { base, firmas } = await firmarLaminaNueva(proyectoId);
      const porSufijo = Object.fromEntries(firmas.map((x) => [x.sufijo, x.token]));
      setEstado("Subiendo…");
      await subirImagenesFirmadas(base, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });
      await crearLamina(proyectoId, {
        base,
        imagen_w: lista.w,
        imagen_h: lista.h,
        blur: lista.blur,
        epigrafe: epigrafeNueva,
      });
      setEpigrafeNueva("");
      setEstado(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar la lámina.");
      setEstado(null);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="titular text-lg">Láminas</h2>

      <div className="mt-4 grid max-w-3xl gap-3 border border-linea p-4">
        <p className="etiqueta text-tinta-media">Agregar lámina (JPEG, PNG o WebP)</p>
        <textarea
          value={epigrafeNueva}
          onChange={(e) => setEpigrafeNueva(e.target.value)}
          placeholder="Epígrafe de esta lámina…"
          rows={2}
          className={entrada}
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => agregar(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-linea file:bg-papel file:px-3 file:py-2 file:text-sm hover:file:border-tinta-media"
        />
        {estado && <p className="text-sm text-tinta-media">{estado}</p>}
        {error && <Aviso tipo="error">{error}</Aviso>}
      </div>

      {laminas.length === 0 ? (
        <p className="mt-4 text-sm text-tinta-media">
          Todavía sin láminas. Agregá la primera: va a la …/01, que es la portada del proyecto.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {laminas.map((l) => (
            <FilaLamina key={l.id} lamina={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilaLamina({ lamina }: { lamina: LaminaAdmin }) {
  const router = useRouter();
  const inputArchivo = useRef<HTMLInputElement | null>(null);
  const [epigrafe, setEpigrafe] = useState(lamina.epigrafe ?? "");
  const [orden, setOrden] = useState(String(lamina.orden));
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const numero = lamina.imagen.split("/").pop();

  async function correr(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  async function guardarTexto() {
    await correr(() => actualizarLamina(lamina.id, { epigrafe }));
  }

  function guardarOrden() {
    const n = Number(orden);
    if (!Number.isInteger(n) || n === lamina.orden) {
      setOrden(String(lamina.orden));
      return;
    }
    correr(async () => {
      await actualizarLamina(lamina.id, { orden: n });
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
      const { base, firmas } = await firmarLaminaExistente(lamina.id);
      const porSufijo = Object.fromEntries(firmas.map((x) => [x.sufijo, x.token]));
      await subirImagenesFirmadas(base, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });
      await guardarImagenLamina(lamina.id, { imagen_w: lista.w, imagen_h: lista.h, blur: lista.blur });
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
        <img src={url(lamina.imagen, "md")} alt={`Lámina ${numero}`} className="w-full object-cover" loading="lazy" />
      </figure>
      <div className="grid gap-3 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="etiqueta text-tinta-suave">Lámina …/{numero}</span>
          <div className="flex items-center gap-2">
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
            <Boton
              variante="peligro"
              className="!px-2 !py-1 text-xs"
              onClick={() => {
                if (!window.confirm(`¿Borrar la lámina …/${numero}? Se borran sus tres archivos.`)) return;
                correr(() => borrarLamina(lamina.id));
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
        <div className="flex items-center gap-3">
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
          {estado && <span className="text-xs text-tinta-media">{estado}</span>}
        </div>
        {error && <Aviso tipo="error">{error}</Aviso>}
      </div>
    </article>
  );
}
