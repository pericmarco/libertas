import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const votes = [
  {
    title: 'Soll der Chlodwigplatz autofrei werden?',
    description: 'Die Stadtverwaltung prüft eine temporäre Sperrung für den Autoverkehr.',
    ends_at: '28. April 2025',
    total: 2340,
    score: 82,
    options: [
      { label: 'Ja', percent: 67 },
      { label: 'Nein', percent: 24 },
      { label: 'Unentschieden', percent: 9 },
    ],
  },
  {
    title: 'Mehr Mittel für Schulen in Neustadt-Süd?',
    description: 'Bürgerabstimmung über die Umverteilung des Stadtbezirksbudgets.',
    ends_at: '5. Mai 2025',
    total: 891,
    score: 61,
    options: [
      { label: 'Ja', percent: 78 },
      { label: 'Nein', percent: 14 },
      { label: 'Unentschieden', percent: 8 },
    ],
  },
]

export default function Abstimmungen() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Abstimmungen</h1>
            <p className="text-gray-500 mt-1">Laufende Bürgerabstimmungen in deinem Wahlkreis</p>
          </div>

          <div className="flex flex-col gap-6">
            {votes.map((vote, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-semibold leading-snug">{vote.title}</CardTitle>
                    <Badge className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-50">Läuft bis {vote.ends_at}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{vote.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 mb-6">
                    {vote.options.map((opt) => (
                      <div key={opt.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{opt.label}</span>
                          <span className="text-gray-500">{opt.percent}%</span>
                        </div>
                        <Progress value={opt.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">{vote.total.toLocaleString('de-DE')} Teilnehmer · Repräsentations-Score: <span className="font-semibold text-gray-700">{vote.score}/100</span></div>
                    <button className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Jetzt abstimmen
                    </button>
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
