"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { alternarLeida, borrarConsulta } from "@/lib/admin/acciones-consultas";
import type { ConsultaAdmin } from "@/lib/admin/datos";
import { Boton } from "@/components/admin/ui";
import { t } from "@/lib/i18n";

const TIPOS: Record<string, string> = t("es").encargos.opciones.tipos;
const DESTINOS: Record<string, string> = t("es").encargos.opciones.destinos;

function Dato({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="etiqueta text-tinta-suave">{termino}</dt>
      <dd className="mt-1">{valor}</dd>
    </div>
  );
}

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
              {c.clase === "encargo" && (
                <span className="border border-linea px-2 py-0.5">Encargo</span>
              )}
              <Fecha iso={c.creado_at} />
              {c.obra_titulo && <span>sobre «{c.obra_titulo}»</span>}
            </div>
          </header>
          <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">{c.mensaje}</p>

          {c.clase === "encargo" && (
            <div className="mt-5 border-t border-linea pt-4">
              <p className="etiqueta text-tinta-suave">Proyecto por encargo</p>
              <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {c.tipo_proyecto && (
                  <Dato
                    termino="Tipo"
                    valor={`${TIPOS[c.tipo_proyecto] ?? c.tipo_proyecto}${c.tipo_otro ? ` · ${c.tipo_otro}` : ""}`}
                  />
                )}
                {c.destino && (
                  <Dato
                    termino="Destino"
                    valor={`${DESTINOS[c.destino] ?? c.destino}${c.destino_otro ? ` · ${c.destino_otro}` : ""}`}
                  />
                )}
                {c.whatsapp && <Dato termino="Whatsapp" valor={c.whatsapp} />}
                {(c.ciudad || c.pais) && (
                  <Dato termino="Ubicación" valor={[c.ciudad, c.pais].filter(Boolean).join(", ")} />
                )}
                {c.referencias && <Dato termino="Referencias" valor={c.referencias} />}
              </dl>

              {c.archivos.length > 0 && (
                <div className="mt-5">
                  <p className="etiqueta text-tinta-suave">Adjuntos ({c.archivos.length})</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {c.archivos.map((a) => (
                      <li key={a.path}>
                        {a.url ? (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="etiqueta border border-linea px-3 py-1.5 hover:border-tinta-media"
                          >
                            {a.nombre ?? "imagen"} ↗
                          </a>
                        ) : (
                          <span className="etiqueta border border-linea px-3 py-1.5 text-tinta-suave">
                            {a.nombre ?? "imagen"} (no disponible)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-tinta-suave">
                    Los enlaces vencen a la hora. Recargá la página para renovarlos.
                  </p>
                </div>
              )}
            </div>
          )}

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
