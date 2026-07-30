import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, FileText, Users, Pencil, Newspaper, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { tenant, t } from '@/lib/tenant'
import ElectionsCard from '@/components/ElectionsCard'
import StadtteilCard from '@/components/StadtteilCard'
import PolitischeVertretung from '@/components/PolitischeVertretung'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()

  // Alles auf dieser Seite zeigt ausschließlich Inhalte der aufgerufenen Stadt.
  const city = await getCurrentCity()

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id ?? null

  const { data: districts } = await supabase
    .from('districts')
    .select('id, name')
    .eq('city_id', city.id)

  const districtIds = districts?.map(d => d.id) ?? []

  const [
    { data: topics },
    { data: news },
    { data: elections },
    { data: profile },
    { count: demandsGesamt },
    { count: unterstuetzt },
    { count: eingereicht },
  ] = await Promise.all([
    supabase.from('topics').select('*').eq('city_id', city.id).order('created_at', { ascending: false }),
    supabase.from('news').select('*').in('district_id', districtIds).order('published_at', { ascending: false }).limit(4),
    supabase.from('elections').select('id, title, election_date, expected_year, description').eq('city_id', city.id),
    uid ? supabase.from('profiles').select('district_id').eq('id', uid).single() : Promise.resolve({ data: null }),
    supabase.from('demands').select('id', { count: 'exact', head: true }).eq('city_id', city.id),
    uid ? supabase.from('demand_supports').select('demand_id', { count: 'exact', head: true }).eq('user_id', uid) : Promise.resolve({ count: 0 }),
    uid ? supabase.from('demands').select('id', { count: 'exact', head: true }).eq('user_id', uid) : Promise.resolve({ count: 0 }),
  ])

  const meinStadtteil = districts?.find(d => d.id === profile?.district_id)?.name ?? null

  const stats = [
    { label: 'Insgesamt eingereicht', value: String(demandsGesamt ?? 0), icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Von dir unterstützt', value: String(unterstuetzt ?? 0), icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Von dir eingereicht', value: String(eingereicht ?? 0), icon: Pencil, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} />
              <span>{city.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{uid ? t('dashboardTitle') : `${city.name} im Überblick`}</h1>
            <p className="text-gray-500 mt-1">
              {tenant.productLine === 'campus'
                ? 'Neuigkeiten und Anliegen an deinem Campus'
                : (uid ? 'Aktuelle politische Themen in deinem Stadtbezirk' : `Aktuelle politische Themen in ${city.name}`)}
            </p>
          </div>

          {uid ? (
            <>
              {/* Deine Beteiligung */}
              <h2 className="font-semibold text-gray-900 mb-3">Deine Beteiligung</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <Card key={label}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${color}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
                        <div className="text-sm text-gray-500">{label}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* Gäste: statt persönlicher Beteiligung eine Registrieren-Einladung */
            <div className="bg-blue-600 rounded-2xl px-6 py-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Mach mit in {city.name}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Registriere dich kostenlos, um {tenant.labels.demandPlural} einzureichen, abzustimmen und deine eigene Beteiligung zu sehen.
                </p>
              </div>
              <Link
                href="/register"
                className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Kostenlos registrieren
              </Link>
            </div>
          )}

          {/* Anstehende Wahlen — kommt aus der Datenbank, also pro Stadt korrekt */}
          {tenant.productLine === 'city' && <ElectionsCard elections={elections ?? []} />}

          {/* Stadtteil-Kennzahlen und Ratsverteilung tragen fest hinterlegte
              KÖLNER Daten (amtliche Statistik, Ratswahl 2025). Sie dürfen
              deshalb nur in Köln erscheinen — für jede weitere Stadt müssten
              die Zahlen erst erhoben werden. */}
          {tenant.productLine === 'city' && city.slug === 'koeln' && (
            <>
              <StadtteilCard defaultName={meinStadtteil} />
              <PolitischeVertretung />
            </>
          )}

          {/* Aktuelle News */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Newspaper size={16} className="text-gray-400" />
                  {tenant.productLine === 'campus' ? t('newsTitle') : `Aktuelles aus ${city.name}`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {news && news.length > 0 ? news.map((item, i) => {
                const date = new Date(item.published_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
                const categoryColors: Record<string, string> = {
                  Verkehr: 'bg-blue-100 text-blue-700',
                  Politik: 'bg-purple-100 text-purple-700',
                  Veranstaltung: 'bg-green-100 text-green-700',
                  Umwelt: 'bg-emerald-100 text-emerald-700',
                }
                return (
                  <div key={item.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${i < news.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400">{date}</span>
                        </div>
                        <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                        {item.summary && <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>}
                        {item.source && <div className="text-xs text-gray-400 mt-1.5">Quelle: {item.source}</div>}
                      </div>
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 transition-colors shrink-0 mt-1">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              }) : (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">Keine aktuellen News</div>
              )}
            </CardContent>
          </Card>

          {/* Aktuelle Themen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Aktuelle Themen</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topics && topics.length > 0 ? topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">{topic.title}</div>
                    <div className="text-sm text-gray-500">{topic.category}</div>
                  </div>
                  <Badge variant={topic.status === 'active' ? 'default' : 'secondary'}>
                    {topic.status === 'active' ? 'Aktiv' : 'Ausstehend'}
                  </Badge>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">Keine Themen vorhanden</div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}
