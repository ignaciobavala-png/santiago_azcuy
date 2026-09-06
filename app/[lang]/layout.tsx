import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { Cabecera, Pie } from "@/components/Marco";
import { IDIOMAS, esIdioma, ruta, type Lang } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

/**
 * Lee el tema guardado (o la preferencia del sistema) y lo aplica antes del
 * primer pintado. Si esto viviera en un efecto de React, cada visita en oscuro
 * arrancaria con un destello blanco a pantalla completa.
 */
const TEMA = `try{var t=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

export function generateStaticParams() {
  return IDIOMAS.map((lang) => ({ lang }));
}

const DESCRIPCION: Record<Lang, string> = {
  es: "Obra de Santiago Azcuy: pintura, dibujo, música, arquitectura y El Aprendiz.",
  en: "The work of Santiago Azcuy: painting, drawing, music, architecture and The Apprentice.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = esIdioma(lang) ? lang : "es";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: "Santiago Azcuy", template: "%s — Santiago Azcuy" },
    description: DESCRIPCION[l],
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

  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA }} />
      </head>
      <body className="min-h-screen antialiased">
        <Cabecera lang={lang} />
        {children}
        <Pie lang={lang} />
      </body>
    </html>
  );
}
