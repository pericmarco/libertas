// Vorhaben-Daten des kommunalen Beteiligungsportals (musterstadt.lybertas.de).
// „Vorhaben" = offizielle städtische Projekte mit Zeitplan/Meilensteinen,
// Status und optionaler Verknüpfung zu einer Beteiligung. Reines Frontend,
// fiktive Demo-Daten.

export type VorhabenStatus = 'planung' | 'beteiligung' | 'umsetzung' | 'abgeschlossen'
export type VorhabenKategorie = 'Verkehr' | 'Stadtgrün' | 'Hochbau' | 'Bildung' | 'Digitales' | 'Sport'

export type Phase = { label: string; state: 'done' | 'current' | 'upcoming'; date?: string }
export type Update = { date: string; title: string; text: string }

export type Vorhaben = {
  slug: string
  title: string
  subtitle: string
  description: string
  status: VorhabenStatus
  kategorie: VorhabenKategorie
  department: string
  contact: string
  district: string
  start: string           // ISO
  end: string | null      // geplante Fertigstellung
  budget?: number         // in Euro
  image?: string
  lng?: number
  lat?: number
  processSlug?: string     // verknüpfte Beteiligung
  processTitle?: string
  interest: number         // Interessierte (für Relevanz-Sortierung)
  phases: Phase[]
  updates: Update[]
}

export const VORHABEN_STATUS: Record<VorhabenStatus, { label: string; badge: string; dot: string }> = {
  planung:       { label: 'In Planung',    badge: 'bg-amber-100 text-amber-700',   dot: '#d97706' },
  beteiligung:   { label: 'Beteiligung',   badge: 'bg-green-100 text-green-700',   dot: '#16a34a' },
  umsetzung:     { label: 'In Umsetzung',  badge: 'bg-purple-100 text-purple-700', dot: '#7c3aed' },
  abgeschlossen: { label: 'Abgeschlossen', badge: 'bg-gray-100 text-gray-600',     dot: '#6b7280' },
}

export const KAT_META: Record<VorhabenKategorie, { emoji: string; accent: string }> = {
  Verkehr:   { emoji: '🚦', accent: 'bg-sky-50 text-sky-600' },
  Stadtgrün: { emoji: '🌳', accent: 'bg-green-50 text-green-600' },
  Hochbau:   { emoji: '🏗️', accent: 'bg-orange-50 text-orange-600' },
  Bildung:   { emoji: '🎓', accent: 'bg-indigo-50 text-indigo-600' },
  Digitales: { emoji: '📶', accent: 'bg-purple-50 text-purple-600' },
  Sport:     { emoji: '⚽', accent: 'bg-emerald-50 text-emerald-600' },
}

export const VORHABEN: Vorhaben[] = [
  {
    slug: 'marktplatz-umbau',
    title: 'Umbau des Marktplatzes',
    subtitle: 'Neues, verkehrsberuhigtes Herz der Innenstadt.',
    description:
      'Der Marktplatz wird grundlegend umgestaltet: mehr Aufenthaltsqualität, schattenspendende Bäume, ein neuer Brunnen und Platz für den Wochenmarkt. Die Planung baut direkt auf den Ergebnissen der Bürgerbeteiligung auf.',
    status: 'beteiligung',
    kategorie: 'Stadtgrün',
    department: 'Stadtplanungsamt', contact: 'Frau Dr. Neuhaus', district: 'Innenstadt',
    start: '2026-09-01', end: '2028-06-30', budget: 4_200_000,
    image: '/muster/marktplatz.jpg', lng: 6.826, lat: 51.098,
    processSlug: 'marktplatz', processTitle: 'Neugestaltung Marktplatz',
    interest: 512,
    phases: [
      { label: 'Vorplanung', state: 'done', date: '2026-06' },
      { label: 'Bürgerbeteiligung', state: 'current', date: '2026-09' },
      { label: 'Entwurfsplanung', state: 'upcoming', date: '2027-01' },
      { label: 'Bau', state: 'upcoming', date: '2027-09' },
      { label: 'Fertigstellung', state: 'upcoming', date: '2028-06' },
    ],
    updates: [
      { date: '2026-09-10', title: 'Beteiligung gestartet', text: 'Die Online-Beteiligung ist live. Bis zum 19.10. können Ideen eingebracht und Varianten bewertet werden.' },
      { date: '2026-06-20', title: 'Vorplanung abgeschlossen', text: 'Der Rat hat die Vorplanung zur Kenntnis genommen und die Beteiligung beschlossen.' },
    ],
  },
  {
    slug: 'bahnhofsvorplatz-neu',
    title: 'Neuer Bahnhofsvorplatz',
    subtitle: 'Barrierefreier Ankunftsort mit klaren Wegen.',
    description:
      'Der Bahnhofsvorplatz erhält eine neue Aufteilung: barrierefreie Wege, überdachte Fahrradstellplätze, klar geführte Bus- und Taxispuren sowie mehr Grün. Ziel ist ein einladender erster Eindruck von Musterstadt.',
    status: 'planung',
    kategorie: 'Verkehr',
    department: 'Stadtplanungsamt', contact: 'Frau Dr. Neuhaus', district: 'Bahnhofsviertel',
    start: '2026-10-01', end: '2027-12-31', budget: 2_800_000,
    lng: 6.831, lat: 51.101,
    processSlug: 'bahnhofsvorplatz', processTitle: 'Umbau Bahnhofsvorplatz',
    interest: 289,
    phases: [
      { label: 'Bedarfsermittlung', state: 'done', date: '2026-08' },
      { label: 'Konsultation', state: 'current', date: '2026-10' },
      { label: 'Planung', state: 'upcoming', date: '2027-03' },
      { label: 'Umsetzung', state: 'upcoming', date: '2027-08' },
    ],
    updates: [
      { date: '2026-09-05', title: 'Ortstermin angekündigt', text: 'Am 15.10. findet ein öffentlicher Vor-Ort-Rundgang statt. Anmeldung über den Veranstaltungskalender.' },
    ],
  },
  {
    slug: 'radschnellweg-nord',
    title: 'Radschnellweg Nord',
    subtitle: '4,5 km durchgängige Radverbindung ins Zentrum.',
    description:
      'Ein neuer Radschnellweg verbindet die Wohngebiete im Norden sicher und zügig mit der Innenstadt. Teil der Umsetzung des Mobilitätskonzepts – mit eigener Spur, guter Beleuchtung und Vorrang an Kreuzungen.',
    status: 'umsetzung',
    kategorie: 'Verkehr',
    department: 'Amt für Verkehr', contact: 'Herr Baumann', district: 'Nordstadt',
    start: '2026-04-01', end: '2027-05-31', budget: 3_100_000,
    lng: 6.834, lat: 51.108,
    processSlug: 'mobilitaet-2035', processTitle: 'Mobilitätskonzept 2035',
    interest: 634,
    phases: [
      { label: 'Planung', state: 'done', date: '2026-04' },
      { label: 'Bauabschnitt 1', state: 'done', date: '2026-07' },
      { label: 'Bauabschnitt 2', state: 'current', date: '2026-09' },
      { label: 'Fertigstellung', state: 'upcoming', date: '2027-05' },
    ],
    updates: [
      { date: '2026-09-08', title: 'Bauabschnitt 2 begonnen', text: 'Zwischen Lindenallee und Uferstraße wird ab sofort gebaut. Es kommt zu vorübergehenden Umleitungen.' },
      { date: '2026-07-15', title: 'Erster Abschnitt befahrbar', text: 'Der Abschnitt vom Quartiersplatz bis zur Lindenallee ist fertig und freigegeben.' },
    ],
  },
  {
    slug: 'grundschule-nord-sanierung',
    title: 'Sanierung Grundschule Nord',
    subtitle: 'Energetische Sanierung und neue Mensa.',
    description:
      'Die Grundschule Nord wird energetisch saniert und um eine Mensa sowie zwei Ganztagsräume erweitert. Während der Bauzeit ist der Schulbetrieb durchgehend gesichert.',
    status: 'umsetzung',
    kategorie: 'Bildung',
    department: 'Gebäudemanagement', contact: 'Frau Wagner', district: 'Nordstadt',
    start: '2026-03-01', end: '2027-08-31', budget: 6_500_000,
    lng: 6.828, lat: 51.106,
    interest: 178,
    phases: [
      { label: 'Planung', state: 'done', date: '2025-11' },
      { label: 'Rohbau', state: 'done', date: '2026-03' },
      { label: 'Ausbau', state: 'current', date: '2026-09' },
      { label: 'Fertigstellung', state: 'upcoming', date: '2027-08' },
    ],
    updates: [
      { date: '2026-09-01', title: 'Ausbau läuft', text: 'Der Rohbau der Mensa steht. Aktuell laufen die Innenausbauarbeiten.' },
    ],
  },
  {
    slug: 'stadtpark-aufwertung',
    title: 'Aufwertung Stadtpark',
    subtitle: 'Neue Sitzbereiche, Spielgeräte und Wege.',
    description:
      'Der Stadtpark wird aufgewertet: zusätzliche Sitzbänke, ein erneuerter Spielplatz, barrierearme Wege und neue Bäume. Die Standorte für Bänke gehen direkt aus der Bürgerbeteiligung hervor.',
    status: 'planung',
    kategorie: 'Stadtgrün',
    department: 'Grünflächenamt', contact: 'Herr Klein', district: 'Stadtpark',
    start: '2026-09-01', end: '2027-04-30', budget: 850_000,
    lng: 6.834, lat: 51.104,
    processSlug: 'sitzbaenke-stadtpark', processTitle: 'Mehr Sitzbänke im Stadtpark',
    interest: 221,
    phases: [
      { label: 'Beteiligung', state: 'current', date: '2026-09' },
      { label: 'Planung', state: 'upcoming', date: '2026-12' },
      { label: 'Umsetzung', state: 'upcoming', date: '2027-02' },
    ],
    updates: [
      { date: '2026-09-02', title: 'Standorte werden gesammelt', text: 'Auf der Beteiligungskarte können gewünschte Bank-Standorte markiert werden.' },
    ],
  },
  {
    slug: 'freies-wlan-innenstadt',
    title: 'Freies WLAN in der Innenstadt',
    subtitle: 'Kostenloses öffentliches WLAN auf zentralen Plätzen.',
    description:
      'An zentralen Plätzen und in öffentlichen Gebäuden wird kostenloses, datensparsames WLAN eingerichtet. Der erste Ausbauabschnitt umfasst Marktplatz, Rathaus und Stadtbibliothek.',
    status: 'abgeschlossen',
    kategorie: 'Digitales',
    department: 'Amt für Digitalisierung', contact: 'Frau Özdemir', district: 'Innenstadt',
    start: '2025-09-01', end: '2026-06-30', budget: 210_000,
    lng: 6.827, lat: 51.099,
    interest: 143,
    phases: [
      { label: 'Planung', state: 'done', date: '2025-09' },
      { label: 'Installation', state: 'done', date: '2026-01' },
      { label: 'Inbetriebnahme', state: 'done', date: '2026-06' },
    ],
    updates: [
      { date: '2026-06-28', title: 'WLAN in Betrieb', text: 'Das freie WLAN ist auf dem Marktplatz, im Rathaus und in der Bibliothek verfügbar.' },
    ],
  },
]

export function getVorhaben(slug: string): Vorhaben | undefined {
  return VORHABEN.find(v => v.slug === slug)
}

export function euro(n?: number): string {
  if (n == null) return '–'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export function fmtMonth(iso: string): string {
  // Nimmt „2027-06" oder „2027-06-30" und gibt „Juni 2027".
  const parts = iso.split('-')
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}
