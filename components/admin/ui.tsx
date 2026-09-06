import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Bloques de formulario del panel. Clases planas para que cada formulario
 * quede denso y legible sin inventar un sistema de diseno: tokens de globals,
 * bordes de 1px, radios chicos. Sirven tanto desde paginas server como desde
 * componentes cliente, porque no guardan estado ni usan hooks.
 */

export const entrada =
  "w-full rounded-md border border-linea bg-papel px-3 py-2 text-sm text-tinta outline-none transition-colors placeholder:text-tinta-suave focus:border-tinta-media";

export const etiquetaCampo = "etiqueta mb-1.5 block text-tinta-media";

export function Campo({
  etiqueta,
  children,
  className = "",
  ancho = "auto",
}: {
  etiqueta: string;
  children: ReactNode;
  className?: string;
  ancho?: "auto" | "xs" | "sm" | "md" | "lg";
}) {
  const anchos = { auto: "", xs: "max-w-[7rem]", sm: "max-w-[12rem]", md: "max-w-sm", lg: "max-w-xl" };
  return (
    <label className={`block ${anchos[ancho]} ${className}`}>
      <span className={etiquetaCampo}>{etiqueta}</span>
      {children}
    </label>
  );
}

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "solido" | "borde" | "peligro" | "texto";
};

export function Boton({ variante = "borde", className = "", ...rest }: BotonProps) {
  const estilos: Record<string, string> = {
    solido: "bg-tinta text-papel hover:opacity-85",
    borde: "border border-linea text-tinta hover:border-tinta-media",
    peligro: "border border-tinta/20 text-tinta hover:border-tinta hover:bg-tinta hover:text-papel",
    texto: "text-tinta-media underline-offset-4 hover:text-tinta hover:underline",
  };
  return (
    <button
      type="button"
      className={`rounded-md px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${estilos[variante]} ${className}`}
      {...rest}
    />
  );
}

export function Aviso({ children, tipo = "ok" }: { children: ReactNode; tipo?: "ok" | "error" | "neutro" }) {
  const colores = {
    ok: "border-linea bg-papel-alt text-tinta",
    error: "border-tinta/30 bg-papel-alt text-tinta",
    neutro: "border-linea text-tinta-media",
  };
  return (
    <p
      role={tipo === "error" ? "alert" : "status"}
      className={`border-y px-3 py-2 text-sm ${colores[tipo]}`}
    >
      {children}
    </p>
  );
}
