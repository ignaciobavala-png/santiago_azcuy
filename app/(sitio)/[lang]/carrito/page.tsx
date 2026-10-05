import type { Lang } from "@/lib/i18n";
import { PaginaCarrito } from "@/components/market/Carrito";

export default async function Carrito({ params }: { params: Promise<{ lang: Lang }> }) {
  return <PaginaCarrito lang={(await params).lang} />;
}
