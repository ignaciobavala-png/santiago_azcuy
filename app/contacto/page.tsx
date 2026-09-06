import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";

export const metadata: Metadata = { title: "Contacto" };

export default function Pagina() {
  return <EnConstruccion titulo="Contacto" nota="Formulario de consulta. Pendiente de carga." />;
}
