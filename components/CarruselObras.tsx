"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { srcSet, url } from "@/lib/media";
import { ruta, type Lang } from "@/lib/i18n";
import { ficha, type Obra } from "@/lib/tipos";

/**
 * El bloque grande de la home, ahora con varias obras en lugar de una sola.
 *
 * El desplazamiento es scroll-snap nativo: el swipe tactil, el arrastre con
 * trackpad y el teclado salen gratis y siguen funcionando sin JS. Los botones
 * y el avance solo son un agregado encima.
 *
 * El avance automatico se pausa cuando el carrusel no esta a la vista. No es
 * un detalle de cortesia: cada lamina en pantalla completa pesa cientos de KB,
 * y con 5 GB de egress al mes, adelantar obras que nadie esta mirando se paga
 * en ancho de banda. Quien pasa de largo scrolleando solo baja la primera.
 */
export function CarruselObras({
  obras,
  lang,
}: {
  obras: Obra[];
  lang: Lang;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [corre, setCorre] = useState(false);

  const irA = useCallback((i: number) => {
    const el = pista.current;
    if (!el) return;
    const n = obras.length;
    el.scrollTo({ left: el.clientWidth * ((i + n) % n), behavior: "smooth" });
  }, [obras.length]);

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
    const obs = new IntersectionObserver(
      ([e]) => setCorre(e.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [quieto, setQuieto] = useState(false);

  useEffect(() => {
    if (!corre || quieto || obras.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => irA(activo + 1), 6500);
    return () => clearInterval(t);
  }, [corre, quieto, activo, irA, obras.length]);

  if (obras.length === 0) return null;
  const actual = obras[Math.min(activo, obras.length - 1)];

  return (
    <section
      className="mb-24"
      onPointerEnter={() => setQuieto(true)}
      onPointerLeave={() => setQuieto(false)}
      onFocusCapture={() => setQuieto(true)}
      onBlurCapture={() => setQuieto(false)}
      aria-roledescription="carrusel"
    >
      <div
        ref={pista}
        // sin-barra: la barra horizontal nativa ensucia una pagina de obra.
        className="sin-barra flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {obras.map((o, i) => (
          <div
            key={o.id}
            className="flex h-[56vh] w-full shrink-0 snap-center items-center justify-center md:h-[74vh]"
            aria-label={`${i + 1} de ${obras.length}`}
          >
            <Link href={ruta(lang, `/obras/${o.slug}`)} className="block h-full">
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
                className="h-full w-auto object-contain"
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        {/* La ficha vive fuera de la pista: si viajara con cada lamina, el alto
            cambiaria segun el largo del titulo y el carrusel saltaria. */}
        <Link href={ruta(lang, `/obras/${actual.slug}`)} className="group">
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
