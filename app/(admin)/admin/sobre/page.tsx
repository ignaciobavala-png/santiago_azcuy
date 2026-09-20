import Link from "next/link";
import { exigirAdmin } from "@/lib/admin/sesion";
import { sobreMediaAdmin } from "@/lib/admin/datos";
import { SobreGaleria } from "@/components/admin/SobreGaleria";

export const dynamic = "force-dynamic";

export default async function SobrePagina() {
  await exigirAdmin();
  const items = await sobreMediaAdmin();

  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <h1 className="titular">Sobre</h1>
      <p className="mt-2 max-w-prose text-sm text-tinta-media">
        La biografía se edita en{" "}
        <Link href="/admin/textos" className="underline underline-offset-4 hover:text-tinta">
          Textos → Bloques largos → Biografía
        </Link>
        . Acá van las fotos y videos que se muestran debajo, en la página pública &ldquo;Sobre&rdquo;.
      </p>

      <SobreGaleria items={items} />
    </main>
  );
}
