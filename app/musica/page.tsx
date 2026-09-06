import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";

export const metadata: Metadata = { title: "Música" };

export default function Pagina() {
  return <EnConstruccion titulo="Música" nota="Discos, videos y shows. Se cargan embebidos desde Spotify y YouTube, sin ocupar almacenamiento." />;
}
