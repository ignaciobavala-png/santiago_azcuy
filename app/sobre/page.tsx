import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";

export const metadata: Metadata = { title: "Sobre" };

export default function Pagina() {
  return <EnConstruccion titulo="Sobre" nota="Biografía, statement y recorrido. Pendiente de carga." />;
}
