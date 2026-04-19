import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MessageCircle } from 'lucide-react'

const politicians = [
  { name: 'Sarah Müller', party: 'SPD', role: 'Bezirksbürgermeisterin', topics: ['Wohnen', 'ÖPNV'], response_rate: 72 },
  { name: 'Thomas Becker', party: 'CDU', role: 'Ratsherr', topics: ['Wirtschaft', 'Sicherheit'], response_rate: 48 },
  { name: 'Lena Hoffmann', party: 'Grüne', role: 'Bezirksvertreterin', topics: ['Umwelt', 'Fahrrad'], response_rate: 91 },
]

const partyColors: Record<string, string> = {
  SPD: 'bg-red-100 text-red-700',
  CDU: 'bg-gray-100 text-gray-700',
  Grüne: 'bg-green-100 text-green-700',
}

export default function Politiker() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Politische Vertreter</h1>
            <p className="text-gray-500 mt-1">Deine Ansprechpartner in Köln Neustadt-Süd</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {politicians.map((p, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${partyColors[p.party]}`}>{p.party}</span>
                    {p.topics.map(t => (
                      <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 flex items-center gap-1"><MessageCircle size={12} /> Reaktionsquote</span>
                      <span className="font-semibold text-gray-700">{p.response_rate}%</span>
                    </div>
                    <Progress value={p.response_rate} className="h-1.5" />
                  </div>

                  <button className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Forderung senden
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
