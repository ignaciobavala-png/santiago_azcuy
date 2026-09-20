"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { srcSet, url } from "@/lib/media";
import { ruta, type Lang } from "@/lib/i18n";
import { ficha, type Obra } from "@/lib/tipos";

/**
 * El bloque central de la home, con las obras destacadas pasando de a una cada
 * 3 segundos. El listado completo vive en Galeria.
 *
 * El desplazamiento es scroll-snap nativo: el swipe tactil, el arrastre con
 * trackpad y el teclado salen gratis y siguen funcionando sin JS. Los puntos y
 * el avance automatico son un agregado encima.
 *
 * El avance solo corre mientras el carrusel esta a la vista, para no adelantar
 * laminas que nadie mira (cada una pesa cientos de KB). A diferencia de antes,
 * no se pausa con el mouse encima: el carrusel ocupa casi toda la pantalla, asi
 * que el puntero esta siempre adentro y la pausa equivalia a apagarlo.
 */
export function CarruselObras({ obras, lang }: { obras: Obra[]; lang: Lang }) {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [corre, setCorre] = useState(false);

  const irA = useCallback(
    (i: number) => {
      const el = pista.current;
      if (!el) return;
      const n = obras.length;
      el.scrollTo({ left: el.clientWidth * ((i + n) % n), behavior: "smooth" });
    },
    [obras.length]
  );

  // El indice activo se lee del scroll y no al reves: asi el swipe manual y los
  // botones comparten una sola fuente de verdad.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let pendiente = 0;
    const alScrollear = () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() =>
        setActivo(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
      );
    };
    el.addEventListener("scroll", alScrollear, { passive: true });
    return () => {
      cancelAnimationFrame(pendiente);
      el.removeEventListener("scroll", alScrollear);
    };
  }, []);

  // Solo avanza mientras se lo esta viendo.
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setCorre(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!corre || obras.length < 2) return;
    const t = setInterval(() => irA(activo + 1), 3000);
    return () => clearInterval(t);
  }, [corre, activo, irA, obras.length]);

  if (obras.length === 0) return null;
  const actual = obras[Math.min(activo, obras.length - 1)];

  return (
    <section className="carrusel mb-16" aria-roledescription="carrusel">
      <div
        ref={pista}
        // sin-barra: la barra horizontal nativa ensucia una pagina de obra.
        className="carrusel-pista sin-barra flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {obras.map((o, i) => (
          <div
            key={o.id}
            className="flex w-full shrink-0 snap-center items-center justify-center"
            aria-label={`${i + 1} de ${obras.length}`}
          >
            <Link href={ruta(lang, `/galeria/${o.slug}`)} className="block max-h-full max-w-full">
              <img
                src={url(o.imagen, "lg")}
                srcSet={srcSet(o.imagen)}
                sizes="(min-width: 768px) 88vw, 100vw"
                alt={o.titulo}
                width={o.imagen_w}
                height={o.imagen_h}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                className="carrusel-imagen max-w-full object-contain"
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        {/* La ficha vive fuera de la pista: si viajara con cada lamina, el alto
            cambiaria segun el largo del titulo y el carrusel saltaria. */}
        <Link href={ruta(lang, `/galeria/${actual.slug}`)} className="group">
          <h2 className="text-[1.0625rem] tracking-tight group-hover:opacity-55">
            {actual.titulo}
          </h2>
          <p className="mt-0.5 text-[0.8125rem] text-tinta-media">{ficha(actual)}</p>
        </Link>

        <div className="flex items-center gap-4">
          <ol className="flex items-center gap-2">
            {obras.map((o, i) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-label={o.titulo}
                  aria-current={i === activo}
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    i === activo ? "w-6 bg-tinta" : "w-1.5 bg-linea hover:bg-tinta-suave"
                  }`}
                />
              </li>
            ))}
          </ol>
          <span className="etiqueta tabular-nums text-tinta-suave">
            {String(activo + 1).padStart(2, "0")} / {String(obras.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
