// Detail-Inhalte je Beteiligungsverfahren (Demo). Getrennt von demo.ts, damit
// die Übersichtsdaten schlank bleiben. Rein fiktiv.

export type Position = 'unterstuetzung' | 'gegenargument' | 'alternative'

export type Idea = {
  id: string
  title: string
  text: string
  category: string
  author: string
  supports: number
  gegen: number
  alternativen: number
  comments: number
}

export type PollOption = { label: string; percent: number }
export type Poll = {
  question: string
  multi?: boolean
  total: number
  options: PollOption[]
}

export type Variant = {
  id: string
  name: string
  summary: string
  emoji: string
  pros: string[]
  cons: string[]
  votes: number
}

export type EventItem = { title: string; date: string; time: string; place: string; kind: string }

export type ResultBlock = {
  teilnehmende: number
  aussagen: { label: string; percent: number }[]
  massnahmen: { status: 'angenommen' | 'in_pruefung' | 'abgelehnt'; text: string; grund?: string }[]
}

export const IDEAS: Record<string, Idea[]> = {
  marktplatz: [
    { id: 'i1', title: 'Mehr schattenspendende Bäume', text: 'Der Platz heizt sich im Sommer stark auf. Große Bäume würden Aufenthaltsqualität und Mikroklima deutlich verbessern.', category: 'Grün & Klima', author: 'Anwohnerin · Innenstadt', supports: 214, gegen: 12, alternativen: 8, comments: 34 },
    { id: 'i2', title: 'Wochenmarkt erhalten und stärken', text: 'Der Wochenmarkt ist das Herz des Platzes. Bei der Neugestaltung muss genug Fläche für die Marktstände bleiben.', category: 'Nutzung', author: 'Marktbeschicker', supports: 187, gegen: 9, alternativen: 15, comments: 41 },
    { id: 'i3', title: 'Autofrei, aber mit Lieferzonen', text: 'Den Durchgangsverkehr rausnehmen, aber klar geregelte Lieferzeiten für Geschäfte und Gastronomie einplanen.', category: 'Verkehr', author: 'Einzelhändler', supports: 156, gegen: 47, alternativen: 22, comments: 58 },
    { id: 'i4', title: 'Trinkbrunnen und mehr Sitzgelegenheiten', text: 'Ein öffentlicher Trinkbrunnen und schattige Bänke machen den Platz für alle Generationen nutzbar.', category: 'Ausstattung', author: 'Seniorenbeirat', supports: 143, gegen: 4, alternativen: 6, comments: 19 },
  ],
  bahnhofsvorplatz: [
    { id: 'b1', title: 'Überdachte Fahrradabstellanlage', text: 'Am Bahnhof fehlen sichere, überdachte Radstellplätze für Pendler:innen.', category: 'Mobilität', author: 'Pendlerin', supports: 98, gegen: 3, alternativen: 5, comments: 12 },
    { id: 'b2', title: 'Bessere Beleuchtung und Übersicht', text: 'Abends wirkt der Vorplatz unübersichtlich. Hellere Beleuchtung erhöht das Sicherheitsgefühl.', category: 'Sicherheit', author: 'Anwohner', supports: 76, gegen: 2, alternativen: 3, comments: 8 },
  ],
  'mehr-gruen-innenstadt': [
    { id: 'g1', title: 'Baumscheiben begrünen', text: 'Viele Baumscheiben sind kahl. Mit Bepflanzung würden sie zu kleinen grünen Inseln.', category: 'Grün', author: 'Nachbarschaftsinitiative', supports: 121, gegen: 1, alternativen: 4, comments: 9 },
  ],
}

export const POLLS: Record<string, Poll> = {
  marktplatz: {
    question: 'Was ist Ihnen bei der Neugestaltung am wichtigsten?',
    total: 842,
    options: [
      { label: 'Mehr Grün und Schatten', percent: 68 },
      { label: 'Weniger Autoverkehr', percent: 52 },
      { label: 'Mehr Außengastronomie', percent: 43 },
      { label: 'Erhalt des Wochenmarkts', percent: 61 },
    ],
  },
  'mobilitaet-2035': {
    question: 'Welche Verkehrsmittel sollen bis 2035 Priorität haben?',
    multi: true,
    total: 821,
    options: [
      { label: 'Ausbau Radwegenetz', percent: 64 },
      { label: 'Dichterer ÖPNV-Takt', percent: 58 },
      { label: 'Fußgängerfreundliche Innenstadt', percent: 47 },
      { label: 'Erhalt Parkraum', percent: 31 },
    ],
  },
}

export const VARIANTS: Record<string, Variant[]> = {
  marktplatz: [
    { id: 'a', name: 'Variante A · Autofreier Platz', emoji: '🌳', summary: 'Vollständig verkehrsfrei, große Grünflächen, Wochenmarkt im Zentrum.', pros: ['Maximale Aufenthaltsqualität', 'Beste Klimawirkung'], cons: ['Wegfall von Stellplätzen', 'Lieferverkehr nur zeitlich begrenzt'], votes: 412 },
    { id: 'b', name: 'Variante B · Verkehrsberuhigt', emoji: '🚶', summary: 'Tempo-Reduzierung, teils Begegnungszone, Kurzzeitparken am Rand.', pros: ['Kompromiss für Handel', 'Erreichbarkeit bleibt'], cons: ['Weniger Grünfläche', 'Restverkehr auf dem Platz'], votes: 287 },
    { id: 'c', name: 'Variante C · Bestand optimiert', emoji: '🚗', summary: 'Heutiges Verkehrskonzept mit punktuellen Verbesserungen.', pros: ['Geringe Kosten', 'Keine Umgewöhnung'], cons: ['Kaum Aufenthaltsqualität', 'Klimaziele verfehlt'], votes: 143 },
  ],
}

export const EVENTS: Record<string, EventItem[]> = {
  marktplatz: [
    { title: 'Bürgerwerkstatt Marktplatz', date: '2026-09-24', time: '18:00', place: 'Rathaus, Ratssaal', kind: 'Workshop' },
    { title: 'Online-Infoveranstaltung', date: '2026-10-08', time: '19:00', place: 'Online (Videokonferenz)', kind: 'Online-Event' },
  ],
  bahnhofsvorplatz: [
    { title: 'Vor-Ort-Rundgang Bahnhofsvorplatz', date: '2026-10-15', time: '17:00', place: 'Treffpunkt Haupteingang', kind: 'Ortstermin' },
  ],
}

export const RESULTS: Record<string, ResultBlock> = {
  'mehr-gruen-innenstadt': {
    teilnehmende: 611,
    aussagen: [
      { label: 'Mehr Grünflächen', percent: 68 },
      { label: 'Weniger versiegelte Flächen', percent: 52 },
      { label: 'Mehr Außengastronomie', percent: 43 },
    ],
    massnahmen: [
      { status: 'angenommen', text: '20 zusätzliche Straßenbäume in der Innenstadt' },
      { status: 'in_pruefung', text: 'Entsiegelung und Begrünung von drei Parkplätzen' },
      { status: 'abgelehnt', text: 'Vollständige Sperrung der Hauptstraße für Kfz', grund: 'Erreichbarkeit für Anlieferung und Rettungsdienste nicht gewährleistet; stattdessen Prüfung einer temporären Sperrung an Wochenenden.' },
    ],
  },
}
