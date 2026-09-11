import { redirect } from 'next/navigation'
import { getCurrentCity } from '@/lib/city/server'

// Gemeinsamer Guard für den gesamten Kommunal-Baum: rendert NUR auf
// Municipal-Hosts (z. B. musterstadt). Auf Netzwerk-Hosts (app.lybertas.de/
// Köln) Umleitung zur normalen Startseite — so kann das Kommunal-Portal dort
// nicht auftauchen. Die Chrome (Portal-Leiste vs. Admin-Navigation) liegt in
// den Unter-Layouts (portal)/ und admin/.
export default async function KommuneLayout({ children }: { children: React.ReactNode }) {
  const city = await getCurrentCity()
  if (city.product !== 'municipal') redirect('/')
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
