import { revalidatePath } from "next/cache";

/**
 * Las paginas publicas tienen `revalidate = 3600`: sin invalidar, Santiago
 * edita un titulo y no lo ve cambiar en una hora, y concluye que el panel no
 * guarda. Tras cada escritura se invalida el layout raiz del sitio, que arrastra
 * las dos lenguas (espanol en "/" e ingles bajo "/en").
 */
export function invalidarSitio(): void {
  revalidatePath("/", "layout");
  revalidatePath("/en", "layout");
}
