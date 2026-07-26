import { PARTEI_FARBEN } from '@/lib/stadtteilDaten'

// Gemeinsamer Typ für das Politiker-Verzeichnis (Tabelle `politicians`).
export type Politician = {
  id: string
  slug: string
  name: string
  party: string | null
  role: string | null
  constituency: string | null
  district_id: string | null
  topics: string[] | null
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  contact_public: boolean
  verified: boolean
  response_rate: number
  avatar_url: string | null
  claimed_by: string | null
  updated_at?: string | null
}

// Alle im Verzeichnis genutzten Spalten in einem Select.
export const POLITICIAN_COLUMNS =
  'id, slug, name, party, role, constituency, district_id, topics, bio, email, phone, website, contact_public, verified, response_rate, avatar_url, claimed_by, updated_at'

// Parteifarbe (Hex) — fällt auf neutrales Grau zurück.
export function partyColor(party: string | null | undefined): string {
  return (party && PARTEI_FARBEN[party]) || '#6B7280'
}

// Lesbare Textfarbe auf der Parteifarbe (helle Flächen → dunkle Schrift).
export function onPartyText(party: string | null | undefined): string {
  const hex = partyColor(party).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  // Relative Helligkeit (YIQ) — >150 gilt als "hell".
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq > 150 ? '#111827' : '#FFFFFF'
}

// Initialen für den Avatar-Fallback.
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}
