// Veranstaltungskalender des kommunalen Beteiligungsportals.
// Eigenständige Termine (Bürgerwerkstätten, Infoabende, Ortstermine, Feste …).
// Rein fiktive Demo-Daten für „Musterstadt". Optional per processSlug mit
// einer Beteiligung verknüpft.

export type EventKind =
  | 'Workshop'
  | 'Infoabend'
  | 'Ortstermin'
  | 'Online'
  | 'Ratssitzung'
  | 'Fest'
  | 'Sprechstunde'

export type CalendarEvent = {
  slug: string
  title: string
  date: string // ISO yyyy-mm-dd
  time: string // "18:00"
  endTime?: string
  kind: EventKind
  online?: boolean
  place: string
  address?: string
  description: string
  organizer?: string
  registration?: boolean
  capacity?: number
  registered?: number
  processSlug?: string
  processTitle?: string
}

// Farb-/Stil-Zuordnung je Veranstaltungsart (dezent, kommunal-seriös).
export const EVENT_KIND: Record<EventKind, { badge: string; dot: string; tile: string }> = {
  Workshop:     { badge: 'bg-blue-50 text-blue-700',     dot: '#2563eb', tile: 'bg-blue-50 text-blue-700' },
  Infoabend:    { badge: 'bg-indigo-50 text-indigo-700', dot: '#4f46e5', tile: 'bg-indigo-50 text-indigo-700' },
  Ortstermin:   { badge: 'bg-emerald-50 text-emerald-700', dot: '#059669', tile: 'bg-emerald-50 text-emerald-700' },
  Online:       { badge: 'bg-purple-50 text-purple-700', dot: '#7c3aed', tile: 'bg-purple-50 text-purple-700' },
  Ratssitzung:  { badge: 'bg-slate-100 text-slate-700',  dot: '#475569', tile: 'bg-slate-100 text-slate-700' },
  Fest:         { badge: 'bg-amber-50 text-amber-700',   dot: '#d97706', tile: 'bg-amber-50 text-amber-700' },
  Sprechstunde: { badge: 'bg-teal-50 text-teal-700',     dot: '#0d9488', tile: 'bg-teal-50 text-teal-700' },
}

export const EVENTS_CAL: CalendarEvent[] = [
  {
    slug: 'buergerwerkstatt-marktplatz',
    title: 'Bürgerwerkstatt Marktplatz',
    date: '2026-09-24', time: '18:00', endTime: '20:30',
    kind: 'Workshop',
    place: 'Rathaus, Ratssaal', address: 'Rathausplatz 1, 41539 Musterstadt',
    description:
      'In der Bürgerwerkstatt entwickeln wir gemeinsam Gestaltungsideen für den neuen Marktplatz. An Thementischen sammeln wir Vorschläge zu Aufenthaltsqualität, Grün, Wochenmarkt und Verkehr. Keine Vorkenntnisse nötig – alle Interessierten sind herzlich eingeladen.',
    organizer: 'Stadtplanungsamt', registration: true, capacity: 80, registered: 47,
    processSlug: 'marktplatz', processTitle: 'Neugestaltung des Marktplatzes',
  },
  {
    slug: 'infoabend-mobilitaet-2035',
    title: 'Infoabend Mobilitätskonzept 2035',
    date: '2026-10-01', time: '19:00', endTime: '21:00',
    kind: 'Infoabend',
    place: 'Stadthalle, Saal B', address: 'Kulturstraße 12, 41539 Musterstadt',
    description:
      'Die Verwaltung stellt den Entwurf des Mobilitätskonzepts 2035 vor: Radwege, Busangebot, Parkraum und verkehrsberuhigte Zonen. Im Anschluss gibt es Raum für Fragen und Rückmeldungen aus der Bürgerschaft.',
    organizer: 'Amt für Verkehr und Tiefbau', registration: false,
    processSlug: 'mobilitaet-2035', processTitle: 'Mobilitätskonzept 2035',
  },
  {
    slug: 'online-ideenwerkstatt-marktplatz',
    title: 'Online-Ideenwerkstatt Marktplatz',
    date: '2026-10-08', time: '19:00', endTime: '20:30',
    kind: 'Online', online: true,
    place: 'Online (Videokonferenz)',
    description:
      'Für alle, die nicht vor Ort dabei sein können: In der digitalen Ideenwerkstatt sammeln und diskutieren wir Vorschläge zum Marktplatz per Videokonferenz. Den Zugangslink erhalten Sie nach der Anmeldung per E-Mail.',
    organizer: 'Stadtplanungsamt', registration: true, capacity: 200, registered: 63,
    processSlug: 'marktplatz', processTitle: 'Neugestaltung des Marktplatzes',
  },
  {
    slug: 'ortstermin-bahnhofsvorplatz',
    title: 'Vor-Ort-Rundgang Bahnhofsvorplatz',
    date: '2026-10-15', time: '17:00', endTime: '18:30',
    kind: 'Ortstermin',
    place: 'Treffpunkt: Haupteingang Bahnhof', address: 'Bahnhofstraße 2, 41539 Musterstadt',
    description:
      'Gemeinsamer Rundgang über den Bahnhofsvorplatz mit dem Planungsteam. Vor Ort schauen wir uns Wegebeziehungen, Barrierefreiheit und Aufenthaltsflächen an und nehmen Ihre Hinweise direkt auf. Bei jedem Wetter – bitte an passende Kleidung denken.',
    organizer: 'Stadtplanungsamt', registration: true, capacity: 40, registered: 22,
    processSlug: 'bahnhofsvorplatz', processTitle: 'Umbau Bahnhofsvorplatz',
  },
  {
    slug: 'ratssitzung-oktober',
    title: 'Öffentliche Ratssitzung',
    date: '2026-10-22', time: '17:00', endTime: '20:00',
    kind: 'Ratssitzung',
    place: 'Rathaus, Ratssaal', address: 'Rathausplatz 1, 41539 Musterstadt',
    description:
      'Öffentliche Sitzung des Stadtrats. Auf der Tagesordnung stehen u. a. der Sachstand zum Marktplatz und der Haushaltsentwurf. Zuhörerinnen und Zuhörer sind willkommen; die Tagesordnung finden Sie im Ratsinformationssystem.',
    organizer: 'Büro des Bürgermeisters', registration: false,
  },
  {
    slug: 'buergersprechstunde-november',
    title: 'Bürgersprechstunde der Bürgermeisterin',
    date: '2026-11-05', time: '16:00', endTime: '18:00',
    kind: 'Sprechstunde',
    place: 'Rathaus, Zimmer 108', address: 'Rathausplatz 1, 41539 Musterstadt',
    description:
      'Persönliche Sprechstunde: Bringen Sie Ihre Anliegen, Ideen und Fragen direkt zur Bürgermeisterin. Um Wartezeiten zu vermeiden, bitten wir um vorherige Anmeldung mit Stichwort zum Thema.',
    organizer: 'Büro des Bürgermeisters', registration: true, capacity: 12, registered: 8,
  },
  {
    slug: 'stadtteilfest-nordstadt',
    title: 'Stadtteilfest Nordstadt',
    date: '2026-11-14', time: '14:00', endTime: '19:00',
    kind: 'Fest',
    place: 'Quartiersplatz Nordstadt', address: 'Lindenallee 40, 41539 Musterstadt',
    description:
      'Ein Nachmittag für alle: Bühnenprogramm, Mitmachaktionen für Kinder, Infostände der Vereine und ein Beteiligungsstand der Stadt zu geplanten Vorhaben im Viertel. Bei Kaffee und Kuchen ins Gespräch kommen – Eintritt frei.',
    organizer: 'Quartiersmanagement Nordstadt', registration: false,
  },
]

export function getEvent(slug: string): CalendarEvent | undefined {
  return EVENTS_CAL.find(e => e.slug === slug)
}

// Chronologisch sortiert.
export function eventsSorted(): CalendarEvent[] {
  return [...EVENTS_CAL].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))
}

// Nach Monat gruppiert (Schlüssel „2026-10"), chronologisch. Nimmt optional
// eine bereits gefilterte Liste. Datums-Logik liegt bewusst hier im Modul
// (nicht im Render-Body der Komponenten).
export function groupByMonth(
  list: CalendarEvent[] = eventsSorted(),
): { key: string; label: string; events: CalendarEvent[] }[] {
  const sorted = [...list].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))
  const groups = new Map<string, CalendarEvent[]>()
  for (const e of sorted) {
    const key = e.date.slice(0, 7)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return [...groups.entries()].map(([key, events]) => {
    const d = new Date(key + '-01T00:00:00')
    const label = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    return { key, label, events }
  })
}

// Datums-Kachel („Do · Okt · 24") — reine Formatierung, hier gekapselt.
export function dayTile(date: string): { weekday: string; month: string; day: number } {
  const d = new Date(date + 'T00:00:00')
  return {
    weekday: d.toLocaleDateString('de-DE', { weekday: 'short' }),
    month: d.toLocaleDateString('de-DE', { month: 'short' }),
    day: d.getDate(),
  }
}

// Ausführliches Datum („Donnerstag, 24. September 2026").
export function longDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Ist der Termin bereits vorbei? (Bezogen auf „heute").
export function isPast(date: string): boolean {
  const today = new Date()
  const t = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
  return date < t
}
