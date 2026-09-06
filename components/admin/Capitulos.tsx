"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarCapitulos } from "@/lib/admin/acciones-libro";
import { Aviso, Boton } from "@/components/admin/ui";

export type CapituloEditable = {
  id: string;
  numero: number | null;
  titulo: string;
  palabras: number;
  orden: number;
};

/** Edicion de titulo y numero de capitulo. El texto no se toca desde el panel. */
export function Capitulos({ capitulos }: { capitulos: CapituloEditable[] }) {
  const router = useRouter();
  const [filas, setFilas] = useState(capitulos);
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cambiar(id: string, campo: "numero" | "titulo", valor: string) {
    setFilas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [campo]: campo === "numero" ? (valor === "" ? null : Number(valor)) : valor } : f))
    );
  }

  async function guardar() {
    setError(null);
    setEstado("Guardando…");
    const fd = new FormData();
    for (const f of filas) {
      fd.append("id", f.id);
      fd.append(`numero_${f.id}`, f.numero === null ? "" : String(f.numero));
      fd.append(`titulo_${f.id}`, f.titulo);
    }
    try {
      await guardarCapitulos(fd);
      setEstado("Guardado.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setEstado(null);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto border border-linea">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-linea bg-papel-alt text-left">
              <th className="etiqueta w-16 px-3 py-2 font-medium text-tinta-media">N.º</th>
              <th className="etiqueta px-3 py-2 font-medium text-tinta-media">Título</th>
              <th className="etiqueta w-24 px-3 py-2 text-right font-medium text-tinta-media">Palabras</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.id} className="border-b border-linea last:border-0">
                <td className="px-3 py-1.5">
                  <input
                    type="number"
                    value={c.numero === null ? "" : c.numero}
                    onChange={(e) => cambiar(c.id, "numero", e.target.value)}
                    placeholder="·"
                    className="w-14 rounded border border-linea bg-papel px-1.5 py-1 text-sm outline-none focus:border-tinta-media"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    value={c.titulo}
                    onChange={(e) => cambiar(c.id, "titulo", e.target.value)}
                    className="w-full rounded border border-linea bg-papel px-2 py-1 text-sm outline-none focus:border-tinta-media"
                  />
                </td>
                <td className="px-3 py-1.5 text-right text-xs text-tinta-suave">
                  {c.palabras.toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Boton onClick={guardar} variante="solido">Guardar cambios</Boton>
        {estado && <span className="text-sm text-tinta-media">{estado}</span>}
        {error && <Aviso tipo="error">{error}</Aviso>}
      </div>
    </div>
  );
}
