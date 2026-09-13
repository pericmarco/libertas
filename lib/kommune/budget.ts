// Bürgerbudget-Modul: Projektvorschläge, die um ein festes Budget konkurrieren.
// Bürger:innen verteilen ein virtuelles Budget auf Vorschläge („Vormerken").
// Reine Demo-Daten (Frontend), fiktives Musterstadt.

export type BudgetCategory = 'Stadtgrün' | 'Sport' | 'Kultur' | 'Verkehr' | 'Soziales'

export const BUDGET_CAT: Record<BudgetCategory, { emoji: string; color: string }> = {
  Stadtgrün: { emoji: '🌳', color: '#16A34A' },
  Sport:     { emoji: '⚽', color: '#059669' },
  Kultur:    { emoji: '🎭', color: '#7C3AED' },
  Verkehr:   { emoji: '🚲', color: '#2563EB' },
  Soziales:  { emoji: '🤝', color: '#EA580C' },
}

export type BudgetProject = {
  id: string
  title: string
  description: string
  category: BudgetCategory
  cost: number
  district: string
  supports: number
}

export type BudgetPot = {
  total: number
  currency: string
  phaseNote: string
  projects: BudgetProject[]
}

export const BUDGETS: Record<string, BudgetPot> = {
  'buergerbudget-2027': {
    total: 250_000,
    currency: 'EUR',
    phaseNote: 'Vorschläge einreichen bis 28.02.2027 · öffentliche Abstimmung ab 15.03.2027',
    projects: [
      { id: 'bb1', title: 'Neue Spielgeräte im Stadtpark', description: 'Kletterturm, Nestschaukel und ein Wasserspielbereich für den beliebten Spielplatz Nord.', category: 'Stadtgrün', cost: 45_000, district: 'Stadtpark', supports: 312 },
      { id: 'bb2', title: 'Bolzplatz Nordstadt sanieren', description: 'Neuer Kunstrasen, Tore und eine Flutlichtanlage für längere Nutzungszeiten.', category: 'Sport', cost: 60_000, district: 'Nordstadt', supports: 274 },
      { id: 'bb3', title: 'Fünf öffentliche Bücherschränke', description: 'Wetterfeste Tauschregale für Bücher an belebten Plätzen im ganzen Stadtgebiet.', category: 'Kultur', cost: 12_000, district: 'Gesamtstadt', supports: 198 },
      { id: 'bb4', title: 'Vier Fahrrad-Reparaturstationen', description: 'Selbstbedienungs-Stationen mit Werkzeug und Luftpumpe entlang der Radrouten.', category: 'Verkehr', cost: 18_000, district: 'Gesamtstadt', supports: 241 },
      { id: 'bb5', title: 'Schulhof der Grundschule Süd begrünen', description: 'Entsiegelung, Schattenbäume und ein grünes Klassenzimmer für rund 300 Kinder.', category: 'Stadtgrün', cost: 55_000, district: 'Südstadt', supports: 356 },
      { id: 'bb6', title: 'Drei Trinkwasserbrunnen in der Innenstadt', description: 'Kostenloses Trinkwasser an heißen Tagen – gut für Menschen und Klima.', category: 'Soziales', cost: 30_000, district: 'Innenstadt', supports: 289 },
      { id: 'bb7', title: 'Bänke & Beleuchtung an der Rheinpromenade', description: 'Mehr Sitzgelegenheiten und sichere Beleuchtung für den Abendspaziergang.', category: 'Stadtgrün', cost: 40_000, district: 'Uferviertel', supports: 167 },
      { id: 'bb8', title: 'Barrierefreie Rampe am Bürgerhaus', description: 'Stufenloser Zugang zum Veranstaltungssaal für alle Besucher:innen.', category: 'Soziales', cost: 35_000, district: 'Innenstadt', supports: 203 },
      { id: 'bb9', title: 'Insektenwiese am Uferweg', description: 'Extensive Blühwiese mit Infotafeln als Lebensraum und Lernort.', category: 'Stadtgrün', cost: 15_000, district: 'Uferviertel', supports: 152 },
    ],
  },
}

export function euroBudget(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
