// Produktneutrale Metadaten für Beteiligungsverfahren (Network + Musterstadt).
// Der DB-Datensatz aus participation_processes wird hier typisiert.

import type { DialogCategory } from '@/components/participation/Kartendialog'

export type ModuleType =
  | 'information' | 'ideen' | 'karte' | 'umfrage' | 'varianten'
  | 'fragen' | 'buergerbudget' | 'dokument' | 'termine' | 'ergebnisse'

export type ReactionMode = 'support' | 'sca' | 'comments' | 'none'
export type ProcessStatus =
  | 'beteiligung_laeuft' | 'in_auswertung' | 'geplant' | 'umsetzung' | 'abgeschlossen'
export type ResultsMode = 'live' | 'nach' | 'verwaltung'

// Datensatz wie er aus Supabase kommt (snake_case).
export type ProcessRow = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  status: ProcessStatus
  modules: ModuleType[]
  reaction_mode: ReactionMode
  results_mode: ResultsMode
  department: string | null
  contact: string | null
  area: string | null
  starts_at: string | null
  ends_at: string | null
  image_url: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export const STATUS_META: Record<ProcessStatus, { label: string; badge: string }> = {
  beteiligung_laeuft: { label: 'Beteiligung läuft', badge: 'bg-green-100 text-green-700' },
  in_auswertung:      { label: 'In Auswertung',     badge: 'bg-blue-100 text-blue-700' },
  geplant:            { label: 'Geplant',           badge: 'bg-amber-100 text-amber-700' },
  umsetzung:          { label: 'In Umsetzung',      badge: 'bg-purple-100 text-purple-700' },
  abgeschlossen:      { label: 'Abgeschlossen',     badge: 'bg-gray-100 text-gray-600' },
}

export const MODULE_LABEL: Record<ModuleType, string> = {
  information: 'Überblick', ideen: 'Mitmachen', karte: 'Karte', umfrage: 'Umfrage',
  varianten: 'Varianten', fragen: 'Fragen', buergerbudget: 'Bürgerbudget',
  dokument: 'Dokumente', termine: 'Termine', ergebnisse: 'Ergebnisse',
}

export const REACTION_LABEL: Record<ReactionMode, string> = {
  support: 'Unterstützen',
  sca: 'Unterstützen · Gegenargument · Alternative',
  comments: 'Nur Kommentare',
  none: 'Keine öffentlichen Reaktionen',
}

// Module, die in Network bereits vollständig gerendert werden (ohne
// Platzhalter). Wächst, sobald weitere Module produktneutral extrahiert sind.
export const AVAILABLE_MODULES: ModuleType[] = ['information', 'karte']

// Standard-Kategorien für den Kartendialog.
export const DEFAULT_MAP_CATEGORIES: DialogCategory[] = [
  { key: 'vorschlag', label: 'Vorschlag', emoji: '💡', color: '#2563EB' },
  { key: 'problem', label: 'Problem', emoji: '⚠️', color: '#EA580C' },
  { key: 'lob', label: 'Gefällt mir', emoji: '👍', color: '#16A34A' },
]

// Verbleibende Tage bis Ende (oder null). Datums-Logik gekapselt.
export function daysLeft(end: string | null): number | null {
  if (!end) return null
  const ms = new Date(end + 'T23:59:59').getTime() - Date.now()
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
