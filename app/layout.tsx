import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cabecera, Pie } from "@/components/Marco";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Santiago Azcuy",
    template: "%s — Santiago Azcuy",
  },
  description:
    "Obra de Santiago Azcuy: pintura, dibujo, música, arquitectura y El Aprendiz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Cabecera />
        {children}
        <Pie />
      </body>
    </html>
  );
}
