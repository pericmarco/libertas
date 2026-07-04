type ScoreProfile = { age_group: string | null; gender: string | null; stadtteil: string | null }
type Demographic = { category: string; label: string; percentage: number }

// Repräsentativitäts-Score einer Beteiligungs-Kohorte gegenüber der
// Bevölkerungsstruktur von Köln Innenstadt — nach Altersgruppe,
// Geschlecht und Stadtteil.
export function calcRepScore(profiles: ScoreProfile[], demographics: Demographic[]): number {
  const withData = profiles.filter(p => p.age_group && p.gender && p.stadtteil)
  if (withData.length === 0) return 0

  let totalDeviation = 0
  let checks = 0

  for (const category of ['age_group', 'gender', 'stadtteil'] as const) {
    const targets = demographics.filter(d => d.category === category)
    const total = withData.length

    for (const target of targets) {
      const actual = (withData.filter(p => p[category] === target.label).length / total) * 100
      totalDeviation += Math.abs(actual - target.percentage)
      checks++
    }
  }

  const avgDeviation = checks > 0 ? totalDeviation / checks : 0
  return Math.round(Math.max(0, 100 - avgDeviation * 2))
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Gut repräsentativ', color: 'text-green-600' }
  if (score >= 50) return { label: 'Mäßig repräsentativ', color: 'text-yellow-600' }
  return { label: 'Wenig repräsentativ', color: 'text-red-500' }
}
