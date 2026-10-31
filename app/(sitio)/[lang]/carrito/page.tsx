import type { Lang } from "@/lib/i18n";
import { PaginaCarrito, type OpcionesPago } from "@/components/market/Carrito";
import { admin } from "@/lib/admin/cliente";
import { limpiarDatos } from "@/lib/market-pagos";

// Solo se lee si cada forma de pago esta activa; los datos bancarios no salen del servidor.
async function opcionesPago(): Promise<OpcionesPago> {
  try {
    const { data, error } = await admin().from("market_config").select("datos_nacional,datos_internacional").eq("id", true).single();
    if (error || !data) throw error;
    return { nacional: limpiarDatos("nacional", data.datos_nacional).activo, internacional: limpiarDatos("internacional", data.datos_internacional).activo };
  } catch { return { nacional: true, internacional: true }; } // la API vuelve a validar al enviar
}

export default async function Carrito({ params }: { params: Promise<{ lang: Lang }> }) {
  return <PaginaCarrito lang={(await params).lang} opciones={await opcionesPago()} />;
}
