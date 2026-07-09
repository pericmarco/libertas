import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, TrendingUp, Users, CheckCircle, Newspaper, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { REGION_NAME } from '@/lib/constants'
import ElectionsCard from '@/components/ElectionsCard'
import CouncilSeatDistributionChart from '@/components/CouncilSeatDistributionChart'
import { COLOGNE_COUNCIL } from '@/lib/councilSeats'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: region } = await supabase
    .from('regions')
    .select('id')
    .eq('name', REGION_NAME)
    .single()

  const { data: districts } = await supabase
    .from('districts')
    .select('id, population')
    .eq('region_id', region?.id ?? '')

  const districtIds = districts?.map(d => d.id) ?? []
  const totalPopulation = districts?.reduce((sum, d) => sum + (d.population ?? 0), 0) ?? 0

  const [
    { data: topics },
    { count: demandsUmgesetzt },
    { data: news },
    { data: elections },
  ] = await Promise.all([
    supabase.from('topics').select('*').order('created_at', { ascending: false }),
    supabase.from('demands').select('*', { count: 'exact', head: true }).eq('status', 'umgesetzt'),
    supabase.from('news').select('*').in('district_id', districtIds).order('published_at', { ascending: false }).limit(4),
    supabase.from('elections').select('id, title, election_date, expected_year, description'),
  ])

  const stats = [
    { label: 'Aktive Themen', value: String(topics?.filter(t => t.status === 'active').length ?? 0), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Bürger in Köln Innenstadt', value: totalPopulation.toLocaleString('de-DE'), icon: Users, color: 'text-green-600' },
    { label: 'Umgesetzte Forderungen', value: String(demandsUmgesetzt ?? 0), icon: CheckCircle, color: 'text-purple-600' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} />
              <span>Köln Innenstadt</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dein Dashboard</h1>
            <p className="text-gray-500 mt-1">Aktuelle politische Themen in deinem Stadtbezirk</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Anstehende Wahlen */}
          <ElectionsCard elections={elections ?? []} />

          {/* Sitzverteilung im Rat */}
          <CouncilSeatDistributionChart {...COLOGNE_COUNCIL} />

          {/* Aktuelle News */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Newspaper size={16} className="text-gray-400" />
                  Aktuelles aus Köln Innenstadt
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
