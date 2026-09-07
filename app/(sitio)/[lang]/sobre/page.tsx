import type { Metadata } from "next";
import { EnConstruccion } from "@/components/EnConstruccion";
import { type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  return { title: (await dic((await params).lang)).sobre.titulo };
}

export default async function Pagina({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = await dic(lang);
  return <EnConstruccion titulo={d.sobre.titulo} nota={d.sobre.nota} mientras={d.err.mientras} lang={lang} />;
}
