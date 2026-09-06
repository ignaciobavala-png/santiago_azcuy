import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";
import { t, type Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: t((await params).lang).sobre.titulo };
}

export default async function Pagina({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = t(lang).sobre;
  return <EnConstruccion titulo={d.titulo} nota={d.nota} lang={lang} />;
}
