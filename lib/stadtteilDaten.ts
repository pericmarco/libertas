// Amtliche Kennzahlen der fünf Stadtteile von Köln Innenstadt + Sitzverteilung
// der Bezirksvertretung Innenstadt (Dashboard-Research 2026-07-09).
//
// Quellen: Stadt Köln (Strukturdaten Stadtbezirk Innenstadt 31.12.2025,
// Kölner Stadtteilinformationen — Wahlergebnisse 2004–2025) sowie
// Landeswahlleiterin NRW / IT.NRW (Bezirksvertretungswahl 2025).
// Nach der Kommunalwahl 2030 müssen diese Werte aktualisiert werden.
//
// Fachliche Leitplanke aus dem Research: Stadtteile haben KEIN eigenes
// Gremium und keine eigene Sitzverteilung — zuständig ist immer die
// Bezirksvertretung Innenstadt. Deshalb heißt der Wahlergebnis-Block
// „Ratswahl 2025 in <Stadtteil>" und nie „Rat <Stadtteil>".

import type { CouncilSeatDistribution } from '@/lib/councilSeats'

// Parteifarben — identisch zur Rat-Köln-Karte in lib/councilSeats.ts.
// Keine Logos, nur Farben (Produktentscheidung).
export const PARTEI_FARBEN: Record<string, string> = {
  'GRÜNE':     '#64A12D',
  'CDU':       '#111827',
  'SPD':       '#E3000F',
  'DIE LINKE': '#BE3075',
  'AfD':       '#009EE0',
  'Volt':      '#502379',
  'FDP':       '#E5C100',
  'Weitere':   '#9CA3AF',
}

export const BEZIRK = {
  name: 'Innenstadt',
  gremium: 'Bezirksvertretung Innenstadt',
  buergermeisterin: 'Julie Cazier',
  buergermeisterinPartei: 'GRÜNE',
  quelle: 'Quelle: Stadt Köln',
}

export type ParteiErgebnis = { partei: string; anteil: number }

export type Stadtteil = {
  /** Name exakt wie in der districts-Tabelle */
  name: string
  amtlicherCode: number
  einwohner: number
  flaecheKm2: number
  dichteProKm2: number
  /** Ratswahl 2025 im Stadtteil */
  wahlberechtigte: number
  wahlbeteiligung: number
  gueltigeStimmen: number
  /** Stimmenanteile in %, absteigend sortiert (ohne „Weitere") */
  ergebnis: ParteiErgebnis[]
}

export const STADTTEILE: Stadtteil[] = [
  {
    name: 'Altstadt/Süd', amtlicherCode: 101,
    einwohner: 27851, flaecheKm2: 2.36, dichteProKm2: 12000,
    wahlberechtigte: 22656, wahlbeteiligung: 62.7, gueltigeStimmen: 14149,
    ergebnis: [
      { partei: 'GRÜNE', anteil: 33.7 }, { partei: 'SPD', anteil: 15.7 },
      { partei: 'CDU', anteil: 14.3 }, { partei: 'DIE LINKE', anteil: 14.0 },
      { partei: 'Volt', anteil: 6.3 }, { partei: 'AfD', anteil: 5.6 },
      { partei: 'FDP', anteil: 5.3 },
    ],
  },
  {
    name: 'Neustadt/Süd', amtlicherCode: 102,
    einwohner: 37306, flaecheKm2: 2.87, dichteProKm2: 13043,
    wahlberechtigte: 31350, wahlbeteiligung: 67.1, gueltigeStimmen: 20956,
    ergebnis: [
      { partei: 'GRÜNE', anteil: 37.6 }, { partei: 'DIE LINKE', anteil: 16.4 },
      { partei: 'SPD', anteil: 14.7 }, { partei: 'CDU', anteil: 11.9 },
      { partei: 'Volt', anteil: 7.5 }, { partei: 'AfD', anteil: 3.7 },
      { partei: 'FDP', anteil: 3.5 },
    ],
  },
  {
    name: 'Altstadt/Nord', amtlicherCode: 103,
    einwohner: 18333, flaecheKm2: 2.46, dichteProKm2: 7430,
    wahlberechtigte: 14480, wahlbeteiligung: 61.2, gueltigeStimmen: 8830,
    ergebnis: [
      { partei: 'GRÜNE', anteil: 30.7 }, { partei: 'CDU', anteil: 18.6 },
      { partei: 'SPD', anteil: 14.0 }, { partei: 'DIE LINKE', anteil: 13.3 },
      { partei: 'Volt', anteil: 6.3 }, { partei: 'AfD', anteil: 6.0 },
      { partei: 'FDP', anteil: 6.0 },
    ],
  },
  {
    name: 'Neustadt/Nord', amtlicherCode: 104,
    einwohner: 28923, flaecheKm2: 3.49, dichteProKm2: 8353,
    wahlberechtigte: 23767, wahlbeteiligung: 68.5, gueltigeStimmen: 16227,
    ergebnis: [
      { partei: 'GRÜNE', anteil: 35.5 }, { partei: 'CDU', anteil: 14.8 },
      { partei: 'SPD', anteil: 14.5 }, { partei: 'DIE LINKE', anteil: 14.2 },
      { partei: 'Volt', anteil: 7.4 }, { partei: 'AfD', anteil: 4.0 },
      { partei: 'FDP', anteil: 4.0 },
    ],
  },
  {
    name: 'Deutz', amtlicherCode: 105,
    einwohner: 15476, flaecheKm2: 5.24, dichteProKm2: 2923,
    wahlberechtigte: 12228, wahlbeteiligung: 66.0, gueltigeStimmen: 8043,
    ergebnis: [
      { partei: 'GRÜNE', anteil: 29.5 }, { partei: 'SPD', anteil: 15.8 },
      { partei: 'CDU', anteil: 15.6 }, { partei: 'DIE LINKE', anteil: 14.2 },
      { partei: 'Volt', anteil: 6.7 }, { partei: 'AfD', anteil: 6.3 },
      { partei: 'FDP', anteil: 3.2 },
    ],
  },
]

/** Kompaktansicht: Top-N Parteien, Rest als „Weitere" (Summe ergibt 100). */
export function ergebnisKompakt(s: Stadtteil, topN = 5): ParteiErgebnis[] {
  const top = s.ergebnis.slice(0, topN)
  const rest = 100 - top.reduce((sum, p) => sum + p.anteil, 0)
  return [...top, { partei: 'Weitere', anteil: Math.round(rest * 10) / 10 }]
}

/** Vollansicht: alle gelisteten Parteien, Rest als „Weitere". */
export function ergebnisVoll(s: Stadtteil): ParteiErgebnis[] {
  const rest = 100 - s.ergebnis.reduce((sum, p) => sum + p.anteil, 0)
  return [...s.ergebnis, { partei: 'Weitere', anteil: Math.round(rest * 10) / 10 }]
}

// Sitzverteilung der Bezirksvertretung Innenstadt (Wahl 2025, 19 Sitze).
// Endgültiges Ergebnis: Landeswahlleiterin NRW / IT.NRW.
export const BV_INNENSTADT: CouncilSeatDistribution = {
  cityId: 'koeln-innenstadt',
  title: 'Sitzverteilung Bezirksvertretung Innenstadt',
  subtitle: '19 Sitze · Wahlperiode 2025–2030',
  totalSeats: 19,
  sourceNote: 'Quelle: Landeswahlleiterin NRW / IT.NRW, Bezirksvertretungswahl 2025 (Köln, Bezirk 1 Innenstadt)',
  segments: [
    { id: 'gruene', name: 'GRÜNE',     seats: 7, status: 'Fraktion',     color: PARTEI_FARBEN['GRÜNE'] },
    { id: 'linke',  name: 'DIE LINKE', seats: 3, status: 'Fraktion',     color: PARTEI_FARBEN['DIE LINKE'] },
    { id: 'cdu',    name: 'CDU',       seats: 3, status: 'Fraktion',     color: PARTEI_FARBEN['CDU'] },
    { id: 'spd',    name: 'SPD',       seats: 3, status: 'Fraktion',     color: PARTEI_FARBEN['SPD'] },
    { id: 'volt',   name: 'Volt',      seats: 1, status: 'Einzelmandat', color: PARTEI_FARBEN['Volt'] },
    { id: 'afd',    name: 'AfD',       seats: 1, status: 'Einzelmandat', color: PARTEI_FARBEN['AfD'] },
    { id: 'fdp',    name: 'FDP',       seats: 1, status: 'Einzelmandat', color: PARTEI_FARBEN['FDP'] },
  ],
}
