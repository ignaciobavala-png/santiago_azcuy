"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { alternarLeida, borrarConsulta } from "@/lib/admin/acciones-consultas";
import type { ConsultaAdmin } from "@/lib/admin/datos";
import { Boton } from "@/components/admin/ui";

function Fecha({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <span>
      {d.toLocaleDateString("es-AR")} · {d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export function BandejaConsultas({ consultas }: { consultas: ConsultaAdmin[] }) {
  const router = useRouter();
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

  if (consultas.length === 0) {
    return (
      <div className="mt-8">
        <p className="py-10 text-tinta-media">No hay consultas.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {consultas.map((c) => (
        <article
          key={c.id}
          className={`border border-linea p-5 ${c.leida ? "opacity-60" : ""}`}
        >
          <header className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-base font-medium">
              {c.nombre} <span className="font-normal text-tinta-media">· {c.email}</span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-tinta-suave">
              <Fecha iso={c.creado_at} />
              {c.obra_titulo && <span>sobre «{c.obra_titulo}»</span>}
            </div>
          </header>
          <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">{c.mensaje}</p>
          <footer className="mt-4 flex items-center gap-2">
            <Boton onClick={() => correr(() => alternarLeida(c.id))} className="!px-3 !py-1.5 text-xs">
              {c.leida ? "Marcar como no leída" : "Marcar como leída"}
            </Boton>
            <Boton
              variante="peligro"
              className="!px-3 !py-1.5 text-xs"
              onClick={() => {
                if (window.confirm(`¿Borrar la consulta de ${c.nombre}?`)) correr(() => borrarConsulta(c.id));
              }}
            >
              Borrar
            </Boton>
            <a href={`mailto:${c.email}`} className="etiqueta ml-auto text-tinta-media hover:text-tinta">
              Responder por mail →
            </a>
          </footer>
        </article>
      ))}
      {error && <p className="text-sm text-tinta">{error}</p>}
    </div>
  );
}
