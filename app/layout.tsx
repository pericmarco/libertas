import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getCurrentCity } from "@/lib/city/server";
import { brandName } from "@/lib/city/host";
import { CityProvider } from "@/lib/city/context";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

// Titel und Beschreibung folgen der aufgerufenen Stadt: Wer über die eigene
// Subdomain kommt, sieht die Marke der Stadt — nicht zwingend „Lybertas".
export async function generateMetadata(): Promise<Metadata> {
  const city = await getCurrentCity();
  const brand = brandName(city);
  return {
    title: `${brand} – Politische Beteiligung in ${city.name}`,
    description: `Informiere dich, stimme ab und reiche Forderungen ein – direkt in ${city.name}.`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const city = await getCurrentCity();

  return (
    <html lang="de" className="h-full">
      {/* Die Stadtfarbe steht als CSS-Variable global zur Verfügung, damit
          White-Label-Styling später ohne Änderung an jeder Komponente greift. */}
      <body
        className={`${geist.className} min-h-full antialiased bg-gray-50`}
        style={{ ["--brand" as string]: city.primary_color }}
      >
        <CityProvider city={city}>{children}</CityProvider>
        <Analytics />
      </body>
    </html>
  );
}
