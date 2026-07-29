import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ConsentBanner from "@/components/ConsentBanner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lybertas – Politische Beteiligung in deinem Wahlkreis",
  description: "Informiere dich, stimme ab und reiche Forderungen ein – direkt in deinem Wahlkreis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${geist.className} min-h-full antialiased bg-gray-50`}>
        {children}
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
