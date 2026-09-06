import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";

export const metadata: Metadata = { title: "Arquitectura" };

export default function Pagina() {
  return <EnConstruccion titulo="Arquitectura" nota="Templo circular en Chacarita y vivienda en Chapadmalal. Las láminas se están procesando." />;
}
