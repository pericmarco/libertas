import { redirect } from 'next/navigation'
import { getCurrentCity } from '@/lib/city/server'
import MunicipalNav from '@/components/kommune/MunicipalNav'

// Layout des kommunalen Beteiligungsportals. Liegt im Root-Layout (CityProvider
// ist verfügbar) und ergänzt nur die kommunale Kopfleiste + Rahmen. Der
// Netzwerk-Route-Tree bleibt davon vollständig unberührt.
//
// Guard: Der /kommune-Baum darf NUR auf Municipal-Hosts (z. B. musterstadt)
// erscheinen. Auf Netzwerk-Hosts (app.lybertas.de/Köln) wird zur normalen
// Startseite umgeleitet — so kann das Kommunal-Portal dort nicht auftauchen.
export default async function KommuneLayout({ children }: { children: React.ReactNode }) {
  const city = await getCurrentCity()
  if (city.product !== 'municipal') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <MunicipalNav />
      {children}
    </div>
  )
}
