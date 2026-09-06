"use client";

import { useState } from "react";

/**
 * Fachada: se pinta la miniatura y el iframe recien se monta al hacer click.
 * Un iframe de YouTube arrastra alrededor de 1 MB de JS ajeno; con 29 videos en
 * la pagina de musica eso son ~30 MB antes de que nadie le de play a nada. La
 * miniatura sale de i.ytimg.com, asi que tampoco pasa por nuestro egress.
 */
export function YouTube({
  id,
  titulo,
  miniatura = "mqdefault",
  etiqueta,
  cargando,
  prioridad = false,
}: {
  id: string;
  titulo: string;
  miniatura?: string;
  etiqueta: string;
  cargando: string;
  prioridad?: boolean;
}) {
  const [activo, setActivo] = useState(false);

  if (activo) {
    return (
      <div className="relative aspect-video w-full bg-noche">
        <p className="etiqueta absolute inset-0 grid place-items-center text-luz/40">
          {cargando}
        </p>
        <iframe
          // autoplay=1: el visitante ya hizo click, seria raro tener que darle dos veces.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      aria-label={etiqueta}
      className="yt-tapa group relative block aspect-video w-full overflow-hidden bg-papel-alt"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/${miniatura}.jpg`}
        alt=""
        aria-hidden
        loading={prioridad ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
      />
      <span className="absolute inset-0 bg-noche/10 transition-colors group-hover:bg-noche/25" />
      <span className="yt-play absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-noche/55 backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-luz" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
