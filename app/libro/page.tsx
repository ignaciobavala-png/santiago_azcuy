import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";

export const metadata: Metadata = { title: "El Aprendiz" };

export default function Pagina() {
  return <EnConstruccion titulo="El Aprendiz" nota="La novela, su sinopsis y la descarga. Pendiente de carga." />;
}
