import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/server'
import { calcRepScore, scoreLabel } from '@/lib/score'

export default async function Repraesentation() {
  const supabase = await createClient()

  const { data: district } = await supabase
    .from('districts')
    .select('*')
    .eq('name', 'Neustadt-Süd')
    .single()

  const districtId = district?.id ?? ''

  const [{ data: profiles }, { data: demographics }] = await Promise.all([
    supabase.from('profiles').select('age_group, gender').eq('district_id', districtId),
    supabase.from('district_demographics').select('category, label, percentage').eq('district_id', districtId),
  ])

  const score = calcRepScore(profiles ?? [], demographics ?? [])
  const { label: scoreText, color: scoreColor } = scoreLabel(score)

  const withData = (profiles ?? []).filter(p => p.age_group && p.gender)
  const total = profiles?.length ?? 0

  const ageGroups = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+']
  const genders = ['Männlich', 'Weiblich', 'Divers', 'Keine Angabe']

  function pct(list: typeof profiles, key: 'age_group' | 'gender', val: string) {
    if (!list || list.length === 0) return 0
    return Math.round((list.filter(p => p[key] === val).length / list.length) * 100)
  }

  function targetPct(category: string, label: string) {
    return demographics?.find(d => d.category === category && d.label === label)?.percentage ?? 0
  }

  const badgeClass = score >= 75
    ? 'bg-green-100 text-green-700 hover:bg-green-100'
    : score >= 50
    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
    : 'bg-red-100 text-red-600 hover:bg-red-100'

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Repräsentations-Score</h1>
            <p className="text-gray-500 mt-1">
              Wie gut spiegeln die Teilnehmenden die Bevölkerung von Neustadt-Süd wider?
            </p>
          </div>

          {/* Score Karte */}
          <Card className="mb-6 border-2 border-blue-100">
            <CardContent className="p-8">
              <div className="flex items-end gap-4 mb-4">
                <span className={`text-7xl font-bold ${scoreColor}`}>{score}</span>
                <div className="mb-2">
                  <div className="text-gray-400 text-lg">/ 100</div>
                  <Badge className={badgeClass}>{scoreText}</Badge>
                </div>
              </div>
              <Progress value={score} className="h-3 mb-4" />
              <p className="text-sm text-gray-400">
                Basierend auf {withData.length} von {total} registrierten Nutzern mit Demografieangaben · Referenz: Bevölkerungsdaten Köln Neustadt-Süd
              </p>
            </CardContent>
          </Card>

          {/* Was bedeutet der Score */}
          <Card className="mb-8 bg-gray-50 border-gray-100">
            <CardContent className="p-6 text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Was bedeutet dieser Score?</strong><br />
              Ein Score von 100 bedeutet dass die Teilnehmenden exakt die Bevölkerungsstruktur des Stadtteils widerspiegeln — nach Alter und Geschlecht. Je mehr Menschen sich anmelden und abstimmen, desto aussagekräftiger wird das Ergebnis. Politiker können den Score nicht ignorieren: er zeigt objektiv ob eine Abstimmung repräsentativ ist.
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Altersgruppen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Altersgruppen</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {ageGroups.map(ag => {
                  const actual = pct(withData, 'age_group', ag)
                  const target = targetPct('age_group', ag)
                  const diff = actual - target
                  return (
                    <div key={ag}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700">{ag}</span>
                        <span className="text-gray-400">
                          <span className="text-gray-700 font-medium">{actual}%</span> Nutzer ·{' '}
                          {target}% Bevölkerung
                          {diff !== 0 && (
                            <span className={Math.abs(diff) > 5 ? ' text-orange-500 font-medium' : ' text-green-600'}>
                              {' '}({diff > 0 ? '+' : ''}{diff}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gray-300 rounded-full" style={{ width: `${target}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full opacity-80" style={{ width: `${actual}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Geschlecht */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700">Geschlecht</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {genders.map(g => {
                  const actual = pct(withData, 'gender', g)
                  const target = targetPct('gender', g)
                  const diff = actual - target
                  return (
                    <div key={g}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700">{g}</span>
                        <span className="text-gray-400">
                          <span className="text-gray-700 font-medium">{actual}%</span> Nutzer ·{' '}
                          {target}% Bevölkerung
                          {diff !== 0 && (
                            <span className={Math.abs(diff) > 5 ? ' text-orange-500 font-medium' : ' text-green-600'}>
                              {' '}({diff > 0 ? '+' : ''}{diff}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-gray-300 rounded-full" style={{ width: `${target}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full opacity-80" style={{ width: `${actual}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </>
  )
}
