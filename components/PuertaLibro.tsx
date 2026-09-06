"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PuertaLibro() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "error">("listo");
  const [mensaje, setMensaje] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const r = await fetch("/api/libro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (r.ok) {
      router.push("/libro/leer");
      router.refresh();
    } else {
      const { error } = await r.json().catch(() => ({ error: "No se pudo enviar." }));
      setMensaje(error);
      setEstado("error");
    }
  }

  return (
    <form onSubmit={enviar} className="max-w-md">
      <label htmlFor="email" className="etiqueta text-tinta-suave">
        Dejá tu mail y leelo completo
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
          {estado === "enviando" ? "…" : "Leer →"}
        </button>
      </div>
      {estado === "error" && <p className="mt-2 text-sm text-tinta-media">{mensaje}</p>}
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-tinta-media">
        Se guarda solo para avisarte de novedades. Nada más.
      </p>
    </form>
  );
}
