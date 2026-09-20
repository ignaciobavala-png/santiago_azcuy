import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { Cabecera } from "@/components/Cabecera";
import { IDIOMAS, esIdioma, ruta, type Lang } from "@/lib/i18n";
import { dic } from "@/lib/textos";
import "../../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = esIdioma(lang) ? lang : "es";
  const d = await dic(l);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: "Santiago Azcuy", template: "%s — Santiago Azcuy" },
    description: d.meta.descripcion,
    // El español no lleva prefijo, asi que las alternas se escriben a mano.
    alternates: {
      canonical: ruta(l, "/"),
      languages: { es: "/", en: "/en", "x-default": "/" },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esIdioma(lang)) notFound();
  const d = await dic(lang);

  return (
    <html lang={lang} className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Cabecera lang={lang} nav={d.nav} />
        {children}
      </body>
    </html>
  );
}
