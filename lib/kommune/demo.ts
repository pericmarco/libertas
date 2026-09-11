// ─────────────────────────────────────────────────────────────
// Demo-Daten des kommunalen Beteiligungsportals (musterstadt.lybertas.de).
// Reines Frontend, keine Datenbank — so läuft die Vertriebs-Demo sofort und
// unabhängig von Migrationen. Alle Inhalte sind fiktiv, aber glaubwürdig.
// Später kann dies durch echte, admin-gepflegte DB-Inhalte ersetzt werden;
// die Typen bilden bereits das Modul-System ab.
// ─────────────────────────────────────────────────────────────

export type ModuleType =
  | 'information' | 'ideen' | 'karte' | 'umfrage' | 'varianten'
  | 'fragen' | 'buergerbudget' | 'dokument' | 'termine' | 'ergebnisse'

export type ReactionMode = 'support' | 'sca' | 'comments' | 'none'
// 'sca' = Unterstützen / Gegenargument / Alternative (Lybertas-Modell)

export type ProcessStatus =
  | 'beteiligung_laeuft' | 'in_auswertung' | 'geplant' | 'umsetzung' | 'abgeschlossen'

export type Beteiligungsstufe = 'Information' | 'Konsultation' | 'Mitentscheidung'

export type ParticipationProcess = {
  slug: string
  title: string
  subtitle: string
  description: string
  status: ProcessStatus
  department: string       // zuständiges Fachamt
  contact: string          // Ansprechpartner:in
  district: string         // Ort/Stadtteil
  start: string            // ISO
  end: string | null       // ISO
  level: Beteiligungsstufe
  accent: string           // Tailwind-Akzentklassen fürs Hero-Icon
  emoji: string
  image?: string           // optionales Titelbild (Pfad unter /public)
  modules: ModuleType[]
  reactionMode: ReactionMode
  stats: { teilnehmende: number; beitraege: number; reaktionen: number }
}

export const STATUS_META: Record<ProcessStatus, { label: string; badge: string }> = {
  beteiligung_laeuft: { label: 'Beteiligung läuft', badge: 'bg-green-100 text-green-700' },
  in_auswertung:      { label: 'In Auswertung',     badge: 'bg-blue-100 text-blue-700' },
  geplant:            { label: 'Geplant',           badge: 'bg-amber-100 text-amber-700' },
  umsetzung:          { label: 'In Umsetzung',      badge: 'bg-purple-100 text-purple-700' },
  abgeschlossen:      { label: 'Abgeschlossen',     badge: 'bg-gray-100 text-gray-600' },
}

export const MODULE_LABEL: Record<ModuleType, string> = {
  information: 'Information',
  ideen: 'Ideen',
  karte: 'Karte',
  umfrage: 'Umfrage',
  varianten: 'Variantenvergleich',
  fragen: 'Fragen & Antworten',
  buergerbudget: 'Bürgerbudget',
  dokument: 'Dokumenten-Dialog',
  termine: 'Termine',
  ergebnisse: 'Ergebnisse',
}

export const REACTION_LABEL: Record<ReactionMode, string> = {
  support: 'Unterstützen',
  sca: 'Unterstützen · Gegenargument · Alternative',
  comments: 'Nur Kommentare',
  none: 'Keine öffentlichen Reaktionen',
}

export const PROCESSES: ParticipationProcess[] = [
  {
    slug: 'marktplatz',
    title: 'Neugestaltung Marktplatz',
    subtitle: 'Wie soll das Herz der Innenstadt künftig aussehen?',
    description:
      'Der Marktplatz soll neu gestaltet werden — mehr Aufenthaltsqualität, weniger Durchgangsverkehr, ein lebendiges Zentrum für alle. Bringen Sie Ihre Ideen ein, bewerten Sie Varianten und diskutieren Sie mit.',
    status: 'beteiligung_laeuft',
    department: 'Stadtplanungsamt',
    contact: 'Frau Dr. Neuhaus',
    district: 'Innenstadt',
    start: '2026-09-01', end: '2026-10-19',
    level: 'Mitentscheidung',
    accent: 'bg-blue-50 text-blue-600', emoji: '🏛️',
    modules: ['information', 'ideen', 'karte', 'varianten', 'umfrage', 'termine', 'ergebnisse'],
    reactionMode: 'sca',
    stats: { teilnehmende: 842, beitraege: 124, reaktionen: 317 },
  },
  {
    slug: 'mobilitaet-2035',
    title: 'Mobilitätskonzept 2035',
    subtitle: 'Wie wollen wir uns in Zukunft fortbewegen?',
    description:
      'Die Stadt entwickelt ein Mobilitätskonzept für die nächsten zehn Jahre. In einer Umfrage können Sie Prioritäten setzen — vom Radwegenetz über den ÖPNV bis zum Parkraum.',
    status: 'beteiligung_laeuft',
    department: 'Amt für Verkehr',
    contact: 'Herr Baumann',
    district: 'Gesamtstadt',
    start: '2026-08-15', end: '2026-12-15',
    level: 'Konsultation',
    accent: 'bg-emerald-50 text-emerald-600', emoji: '🚲',
    modules: ['information', 'umfrage', 'dokument', 'ergebnisse'],
    reactionMode: 'comments',
    stats: { teilnehmende: 821, beitraege: 0, reaktionen: 0 },
  },
  {
    slug: 'buergerbudget-2027',
    title: 'Bürgerbudget 2027',
    subtitle: '250.000 € — Sie entscheiden mit, wofür.',
    description:
      'Zum ersten Mal stellt Musterstadt ein Bürgerbudget bereit. Reichen Sie Projektideen ein, die Verwaltung prüft die Umsetzbarkeit, anschließend stimmen die Bürger:innen ab, welche Projekte umgesetzt werden.',
    status: 'geplant',
    department: 'Kämmerei',
    contact: 'Frau Özdemir',
    district: 'Gesamtstadt',
    start: '2027-01-01', end: '2027-03-31',
    level: 'Mitentscheidung',
    accent: 'bg-purple-50 text-purple-600', emoji: '💶',
    modules: ['information', 'buergerbudget', 'termine', 'ergebnisse'],
    reactionMode: 'support',
    stats: { teilnehmende: 0, beitraege: 0, reaktionen: 0 },
  },
  {
    slug: 'bahnhofsvorplatz',
    title: 'Umbau Bahnhofsvorplatz',
    subtitle: 'Ein neuer erster Eindruck für Musterstadt.',
    description:
      'Der Bahnhofsvorplatz wird umgebaut. In der Konsultationsphase sammeln wir Hinweise, Ideen und Ortskenntnis der Bürger:innen, bevor die Planung konkretisiert wird.',
    status: 'beteiligung_laeuft',
    department: 'Stadtplanungsamt',
    contact: 'Frau Dr. Neuhaus',
    district: 'Bahnhofsviertel',
    start: '2026-10-01', end: '2026-11-30',
    level: 'Konsultation',
    accent: 'bg-sky-50 text-sky-600', emoji: '🚉',
    modules: ['information', 'ideen', 'karte', 'termine'],
    reactionMode: 'sca',
    stats: { teilnehmende: 382, beitraege: 119, reaktionen: 205 },
  },
  {
    slug: 'mehr-gruen-innenstadt',
    title: 'Mehr Grün in der Innenstadt',
    subtitle: 'Wo sollen neue Bäume und Grünflächen entstehen?',
    description:
      'Auf einer Karte können Sie Orte markieren, an denen Sie sich mehr Grün wünschen — mit kurzer Begründung. Andere können Ihre Vorschläge unterstützen.',
    status: 'in_auswertung',
    department: 'Grünflächenamt',
    contact: 'Herr Klein',
    district: 'Innenstadt',
    start: '2026-06-01', end: '2026-08-31',
    level: 'Konsultation',
    accent: 'bg-green-50 text-green-600', emoji: '🌳',
    modules: ['information', 'karte', 'ideen', 'ergebnisse'],
    reactionMode: 'support',
    stats: { teilnehmende: 611, beitraege: 143, reaktionen: 489 },
  },
]

// Zusätzliche, bild-hinterlegte Bürger-Beteiligungen (kleinere Anliegen).
PROCESSES.push(
  {
    slug: 'sitzbaenke-stadtpark',
    title: 'Mehr Sitzbänke im Stadtpark',
    subtitle: 'Wo fehlen Ihnen Sitzgelegenheiten zum Verweilen?',
    description:
      'Der Stadtpark ist ein beliebter Treffpunkt — doch an vielen Stellen fehlen Sitzbänke. Markieren Sie auf der Karte, wo neue Bänke stehen sollten, und bringen Sie Ihre Ideen ein.',
    status: 'beteiligung_laeuft',
    department: 'Grünflächenamt', contact: 'Herr Klein', district: 'Stadtpark',
    start: '2026-09-01', end: '2026-10-31', level: 'Konsultation',
    accent: 'bg-green-50 text-green-600', emoji: '🪑', image: '/muster/sitzbaenke-stadtpark.jpg',
    modules: ['information', 'ideen', 'karte', 'ergebnisse'],
    reactionMode: 'support',
    stats: { teilnehmende: 234, beitraege: 41, reaktionen: 186 },
  },
  {
    slug: 'sicherer-schulweg',
    title: 'Sicherer Schulweg an der Hauptstraße',
    subtitle: 'Wie machen wir den Schulweg für Kinder sicherer?',
    description:
      'Viele Kinder queren die Hauptstraße auf dem Weg zur Grundschule. Eltern und Anwohner:innen berichten von gefährlichen Stellen. Teilen Sie Ihre Beobachtungen und Vorschläge — von Zebrastreifen bis Tempo 30.',
    status: 'beteiligung_laeuft',
    department: 'Amt für Verkehr', contact: 'Herr Baumann', district: 'Innenstadt',
    start: '2026-08-20', end: '2026-11-14', level: 'Konsultation',
    accent: 'bg-amber-50 text-amber-600', emoji: '🚸', image: '/muster/schulweg-hauptstrasse.jpg',
    modules: ['information', 'ideen', 'karte', 'umfrage', 'ergebnisse'],
    reactionMode: 'sca',
    stats: { teilnehmende: 472, beitraege: 88, reaktionen: 263 },
  },
  {
    slug: 'buslinie-4',
    title: 'Bessere Taktung der Buslinie 4',
    subtitle: 'Wie oft sollte die Linie 4 künftig fahren?',
    description:
      'Die Buslinie 4 verbindet die Wohngebiete mit der Innenstadt. Viele Fahrgäste wünschen sich einen dichteren Takt. In einer kurzen Umfrage können Sie Ihre Prioritäten setzen.',
    status: 'in_auswertung',
    department: 'Amt für Verkehr', contact: 'Frau Sommer', district: 'Gesamtstadt',
    start: '2026-07-01', end: '2026-08-31', level: 'Konsultation',
    accent: 'bg-sky-50 text-sky-600', emoji: '🚌', image: '/muster/buslinie-4.jpg',
    modules: ['information', 'umfrage', 'ergebnisse'],
    reactionMode: 'comments',
    stats: { teilnehmende: 543, beitraege: 0, reaktionen: 0 },
  },
)

export function getProcess(slug: string): ParticipationProcess | undefined {
  return PROCESSES.find(p => p.slug === slug)
}

// Verbleibende Tage bis Ende der Beteiligung (oder null).
export function daysLeft(end: string | null): number | null {
  if (!end) return null
  const ms = new Date(end + 'T23:59:59').getTime() - Date.now()
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
