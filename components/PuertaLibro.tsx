"use client";

import { useState } from "react";
import { ruta, t, type Lang } from "@/lib/i18n";

export function PuertaLibro({ lang }: { lang: Lang }) {
  const d = t(lang).libro;
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "error">("listo");
  const [mensaje, setMensaje] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const r = await fetch("/api/libro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, lang }),
    });
    if (r.ok) {
      // Navegacion dura, a proposito. Antes iba un router.push seguido de un
      // router.refresh en el mismo tick: el refresh vuelve a renderizar la ruta
      // actual y puede pisar el push pendiente. Resultado observado: el mail se
      // guardaba, la cookie se emitia, y el visitante se quedaba en la misma
      // pagina sin ningun aviso de que algo hubiera pasado.
      //
      // Una carga completa aplica la cookie sin depender del cache del router
      // del cliente. Es una sola vez por visitante; no vale la pena ahorrarse
      // una navegacion a cambio de que a veces no pase nada.
      window.location.assign(ruta(lang, "/libro/leer"));
      // Sin volver a "listo": el boton queda deshabilitado hasta que carga la
      // pagina nueva, en vez de parecer que no hizo nada.
      return;
    } else {
      const { error } = await r.json().catch(() => ({ error: "No se pudo enviar." }));
      setMensaje(error);
      setEstado("error");
    }
  }

  return (
    <form onSubmit={enviar} className="max-w-md">
      <label htmlFor="email" className="etiqueta text-tinta-suave">
        {d.puertaLabel}
      </label>
      <div className="mt-3 flex border-b border-tinta">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEstado("listo"); }}
          placeholder="tu@mail.com"
          className="w-full bg-transparent py-2.5 outline-none placeholder:text-tinta-suave"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="etiqueta shrink-0 px-4 hover:opacity-55 disabled:opacity-40"
        >
          {estado === "enviando" ? "…" : d.puertaBoton}
        </button>
      </div>
      {estado === "error" && <p className="mt-2 text-sm text-tinta-media">{mensaje}</p>}
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-tinta-media">
        {d.puertaNota}
      </p>
    </form>
  );
}
