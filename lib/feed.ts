// Gemeinsames Modell für den Feed. Der Feed führt bestehende Inhaltstypen zur
// Laufzeit zusammen (Forderungen, Umfragen, Infos …) — keine eigene Tabelle.
// Neue Typen (Projekte, Petitionen, Bürgerideen) docken später hier an.

import { THEMENBEREICHE, themenForTags } from '@/lib/einreichung'

export type FeedForderung = {
  type: 'forderung'
  id: string
  title: string
  description: string | null
  areas: string[]
  status: string
  location: string | null
  relevance: number
  supports: number
  counters: number
  alternatives: number
  beitraege: number
  createdAt: string
}

export type FeedUmfrage = {
  type: 'umfrage'
  id: string
  title: string
  description: string | null
  sender: string
  district: string | null
  totalVotes: number
  endsAt: string | null
  createdAt: string
}

export type FeedInfo = {
  type: 'info'
  id: string
  title: string
  summary: string | null
  category: string | null
  source: string | null
  sourceUrl: string | null
  district: string | null
  createdAt: string
}

export type FeedItem = FeedForderung | FeedUmfrage | FeedInfo

// Alt-Forderungen (vor dem Tag-System) auf die neuen Themenbereiche abbilden.
const OLD_CATEGORY_TO_BEREICH: Record<string, string> = {
  Verkehr: 'Verkehr & Mobilität',
  Sicherheit: 'Sicherheit & Ordnung',
  Umwelt: 'Umwelt & Sauberkeit',
  Wohnen: 'Wohnen',
  Soziales: 'Soziales & Zusammenleben',
  Bildung: 'Bildung & Betreuung',
  Stadtentwicklung: 'Stadtentwicklung & öffentlicher Raum',
  Sonstiges: 'Sonstiges',
}

export function areasForDemand(d: { tags: string[] | null; category: string | null }): string[] {
  if (d.tags && d.tags.length > 0) {
    const areas = themenForTags(d.tags)
    if (areas.length > 0) return areas
  }
  if (d.category) return [OLD_CATEGORY_TO_BEREICH[d.category] ?? d.category]
  return ['Sonstiges']
}

export const STATUS_LABEL: Record<string, string> = {
  eingereicht: 'Eingereicht', geprüft: 'Geprüft', bearbeitet: 'In Bearbeitung',
  umgesetzt: 'Umgesetzt', abgelehnt: 'Abgelehnt', zurückgezogen: 'Zurückgezogen',
}

// Sortierschlüssel (neueste zuerst)
export function feedSortKey(i: FeedItem): string {
  return i.createdAt ?? ''
}

// Alle bekannten Themenbereiche (für evtl. spätere Feed-Filter)
export const AREA_KEYS = Object.keys(THEMENBEREICHE)
