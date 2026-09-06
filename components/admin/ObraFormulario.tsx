"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarObra,
  crearObra,
  firmarSubidaObraNueva,
} from "@/lib/admin/acciones-obras";
import { esHeic, procesarImagen, subirImagenesFirmadas } from "@/lib/imagen-navegador";
import type { ObraAdmin } from "@/lib/admin/datos";
import { Aviso, Boton, Campo } from "@/components/admin/ui";
import { CATEGORIAS, type Categoria, type Serie } from "@/lib/tipos";
import { slugDesde } from "@/lib/slug";

const fmtComa = (n: number | null) => {
  if (n === null || n === undefined) return "";
  const s = Number(n).toString();
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "").replace(".", ",") : s;
};

const parseMedida = (s: string) => {
  const limpio = s.trim();
  if (!limpio) return { valor: null, error: null as string | null };
  const n = Number(limpio.replace(",", "."));
  if (!Number.isFinite(n)) return { valor: null, error: "Medida no valida." };
  return { valor: n, error: null as string | null };
};

export function ObraFormulario({
  obra,
  series,
}: {
  obra?: ObraAdmin;
  series: Serie[];
}) {
  const esNueva = !obra;
  const router = useRouter();

  const [titulo, setTitulo] = useState(obra?.titulo ?? "");
  const [categoria, setCategoria] = useState<Categoria>(obra?.categoria ?? "figurativo");
  const [anio, setAnio] = useState(obra?.anio ? String(obra.anio) : "");
  const [tecnica, setTecnica] = useState(obra?.tecnica ?? "");
  const [ancho, setAncho] = useState(fmtComa(obra?.ancho_cm ?? null));
  const [alto, setAlto] = useState(fmtComa(obra?.alto_cm ?? null));
  const [serie, setSerie] = useState(obra?.serie_id ?? "");
  const [esEncargo, setEsEncargo] = useState(obra?.es_encargo ?? false);
  const [destacada, setDestacada] = useState(obra?.destacada ?? false);
  const [disponible, setDisponible] = useState(obra?.disponible ?? true);
  const [publicada, setPublicada] = useState(obra?.publicada ?? true);
  const [descripcion, setDescripcion] = useState(obra?.descripcion ?? "");
  const [orden, setOrden] = useState(String(obra?.orden ?? 0));

  const [archivo, setArchivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const slug = slugDesde(titulo);

  const manejarArchivo = (f: File | null) => {
    setArchivo(f);
    setError(null);
    if (f && esHeic(f)) {
      setError(
        "Ese archivo es HEIC (foto de iPhone): el navegador no lo decodifica. Convertilo a JPEG/PNG o subilo con el script local."
      );
    }
  };

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardado(false);

    if (!titulo.trim()) return setError("El titulo no puede quedar vacio.");
    const mAncho = parseMedida(ancho);
    const mAlto = parseMedida(alto);
    if (mAncho.error || mAlto.error) return setError(mAncho.error ?? mAlto.error ?? "");
    const anioN = anio.trim() ? Number(anio.trim()) : null;
    if (anioN !== null && !Number.isInteger(anioN)) return setError("El anio tiene que ser un entero.");
    const ordenN = Number(orden);
    if (!Number.isInteger(ordenN)) return setError("El orden tiene que ser un entero.");

    const comunes = {
      titulo: titulo.trim(),
      categoria,
      anio: anioN,
      tecnica: tecnica.trim() || null,
      ancho_cm: mAncho.valor,
      alto_cm: mAlto.valor,
      serie_id: serie || null,
      es_encargo: esEncargo,
      destacada,
      disponible,
      publicada,
      descripcion: descripcion.trim() || null,
      orden: ordenN,
    };

    try {
      if (!esNueva) {
        await actualizarObra(obra.id, comunes);
        setGuardado(true);
        setEstado(null);
        router.refresh();
        return;
      }

      if (!archivo) return setError("Elegi una imagen para la obra.");
      setEstado("Redimensionando la imagen…");
      const lista = await procesarImagen(archivo);

      setEstado("Pidiendo la subida firmada…");
      const firmas = await firmarSubidaObraNueva(slug);
      const porSufijo = Object.fromEntries(firmas.map((f) => [f.sufijo, f.token]));

      setEstado("Subiendo a Supabase…");
      await subirImagenesFirmadas(`obras/${slug}`, lista, {
        sm: porSufijo.sm as string,
        md: porSufijo.md as string,
        lg: porSufijo.lg as string,
      });

      setEstado("Guardando la ficha…");
      await crearObra({
        slug,
        ...comunes,
        imagen_w: lista.w,
        imagen_h: lista.h,
        blur: lista.blur,
      });
      router.push("/admin/obras?ok=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEstado(null);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-8 grid max-w-4xl gap-x-8 gap-y-5 md:grid-cols-2">
      <Campo etiqueta="Título" className="md:col-span-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        />
      </Campo>

      <Campo etiqueta="Slug" className="md:col-span-2">
        <p className="border-b border-linea py-2 text-sm text-tinta-suave">
          {slug || "obras/…"}
        </p>
      </Campo>

      <Campo etiqueta="Categoría">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as Categoria)}
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Serie">
        <select
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        >
          <option value="">— sin serie —</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Año">
        <input
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          type="number"
          placeholder="2016"
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        />
      </Campo>

      <Campo etiqueta="Técnica">
        <input
          value={tecnica}
          onChange={(e) => setTecnica(e.target.value)}
          placeholder="Acrílico"
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        />
      </Campo>

      <div className="flex gap-4">
        <Campo etiqueta="Ancho (cm)" ancho="sm">
          <input
            value={ancho}
            onChange={(e) => setAncho(e.target.value)}
            inputMode="decimal"
            placeholder="130"
            className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
          />
        </Campo>
        <Campo etiqueta="Alto (cm)" ancho="sm">
          <input
            value={alto}
            onChange={(e) => setAlto(e.target.value)}
            inputMode="decimal"
            placeholder="80"
            className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
          />
        </Campo>
      </div>

      <Campo etiqueta="Descripción" className="md:col-span-2">
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm outline-none focus:border-tinta-media"
        />
      </Campo>

      {esNueva && (
        <Campo etiqueta="Imagen (JPEG, PNG o WebP)" className="md:col-span-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => manejarArchivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-linea file:bg-papel file:px-3 file:py-2 file:text-sm hover:file:border-tinta-media"
          />
          <p className="mt-1 text-xs text-tinta-suave">
            Se generan tres tamaños (400 / 900 / 1800 px) + placeholder. Las fotos HEIC no entran por el navegador.
          </p>
        </Campo>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:col-span-2">
        {(
          [
            ["esEncargo", "Por encargo", esEncargo, setEsEncargo],
            ["destacada", "Destacada", destacada, setDestacada],
            ["disponible", "Disponible", disponible, setDisponible],
            ["publicada", "Publicada", publicada, setPublicada],
          ] as const
        ).map(([k, etiqueta, valor, set]) => (
          <label key={k} className="flex cursor-pointer items-center gap-1.5">
            <input type="checkbox" checked={valor} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-tinta" />
            <span className="text-sm text-tinta-media">{etiqueta}</span>
          </label>
        ))}
        <label className="ml-auto flex items-center gap-1.5">
          <span className="text-sm text-tinta-media">Orden</span>
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="w-20 rounded-md border border-linea bg-papel px-2 py-1.5 text-sm outline-none focus:border-tinta-media"
          />
        </label>
      </div>

      {(error || estado || guardado) && (
        <div className="md:col-span-2">
          {error && <Aviso tipo="error">{error}</Aviso>}
          {estado && <Aviso tipo="neutro">{estado}</Aviso>}
          {guardado && <Aviso tipo="ok">Guardado.</Aviso>}
        </div>
      )}

      <div className="flex items-center gap-3 md:col-span-2">
        <Boton type="submit" variante="solido">
          {esNueva ? "Crear obra" : "Guardar cambios"}
        </Boton>
        {estado && <span className="text-sm text-tinta-media">{estado}</span>}
      </div>
    </form>
  );
}
