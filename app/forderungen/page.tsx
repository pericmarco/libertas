import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, Plus } from 'lucide-react'

const statusColors: Record<string, string> = {
  eingereicht: 'bg-gray-100 text-gray-600',
  geprüft:     'bg-yellow-100 text-yellow-700',
  bearbeitet:  'bg-blue-100 text-blue-700',
  umgesetzt:   'bg-green-100 text-green-700',
  abgelehnt:   'bg-red-100 text-red-600',
}

const demands = [
  { title: 'Mehr Fahrradständer am Barbarossaplatz', category: 'Verkehr', supports: 312, status: 'bearbeitet' },
  { title: 'Beleuchtung an der Haltestelle Ulrepforte', category: 'Sicherheit', supports: 198, status: 'geprüft' },
  { title: 'Neuer Brunnen im Volksgartenpark', category: 'Umwelt', supports: 87, status: 'eingereicht' },
  { title: 'Tempo 30 auf der Bonner Straße', category: 'Verkehr', supports: 540, status: 'umgesetzt' },
]

export default function Forderungen() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bürgerforderungen</h1>
              <p className="text-gray-500 mt-1">Anliegen aus deinem Wahlkreis</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              Forderung einreichen
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {demands.map((d, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-5">
                  <button className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors min-w-[64px]">
                    <ThumbsUp size={18} />
                    <span className="text-sm font-semibold">{d.supports}</span>
                  </button>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{d.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{d.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
