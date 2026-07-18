import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s · Santiago Azcuy",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Santiago Azcuy", url: siteConfig.url }],
  creator: "Santiago Azcuy",
  publisher: "Santiago Azcuy",
  keywords: [...siteConfig.keywords],
  category: "art",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#080a12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-text">
        <div className="starfield" aria-hidden />
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
