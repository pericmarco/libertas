import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, TrendingUp, Users, CheckCircle } from 'lucide-react'

const topics = [
  { title: 'Radwegausbau Neustadt-Süd', category: 'Verkehr', status: 'active' },
  { title: 'Neuer Spielplatz Vorgebirgspark', category: 'Freizeit', status: 'pending' },
  { title: 'ÖPNV-Takt Linie 12 erhöhen', category: 'Verkehr', status: 'active' },
]

const stats = [
  { label: 'Aktive Themen', value: '12', icon: TrendingUp, color: 'text-blue-600' },
  { label: 'Bürger im Wahlkreis', value: '24.800', icon: Users, color: 'text-green-600' },
  { label: 'Umgesetzte Forderungen', value: '8', icon: CheckCircle, color: 'text-purple-600' },
]

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} />
              <span>Köln Neustadt-Süd</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dein Dashboard</h1>
            <p className="text-gray-500 mt-1">Aktuelle politische Themen in deinem Wahlkreis</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

          {/* Repräsentations-Score */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Repräsentations-Score letzte Abstimmung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-3">
                <span className="text-4xl font-bold text-blue-600">78</span>
                <span className="text-gray-400 mb-1">/ 100</span>
                <Badge className="mb-1 bg-green-100 text-green-700 hover:bg-green-100">Gut repräsentativ</Badge>
              </div>
              <Progress value={78} className="h-2 mb-4" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Alter</span><div className="font-medium">Gut verteilt</div></div>
                <div><span className="text-gray-500">Geschlecht</span><div className="font-medium">52% / 48%</div></div>
                <div><span className="text-gray-500">Teilnehmer</span><div className="font-medium">1.240</div></div>
              </div>
            </CardContent>
          </Card>

          {/* Aktuelle Themen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Aktuelle Themen</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">{topic.title}</div>
                    <div className="text-sm text-gray-500">{topic.category}</div>
                  </div>
                  <Badge variant={topic.status === 'active' ? 'default' : 'secondary'}>
                    {topic.status === 'active' ? 'Aktiv' : 'Ausstehend'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}
