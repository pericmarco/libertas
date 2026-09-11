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
  'sitzbaenke-stadtpark': [
    { id: 's1', title: 'Bänke am Teich mit Blick aufs Wasser', text: 'Rund um den Teich fehlen Sitzgelegenheiten — gerade dort würde man gerne verweilen.', category: 'Standort', author: 'Anwohnerin', supports: 96, gegen: 2, alternativen: 3, comments: 11 },
    { id: 's2', title: 'Bänke mit Rückenlehne und Armstützen', text: 'Für ältere Menschen sind Bänke mit Armstützen viel leichter nutzbar.', category: 'Ausstattung', author: 'Seniorenbeirat', supports: 74, gegen: 0, alternativen: 2, comments: 6 },
  ],
  'sicherer-schulweg': [
    { id: 'sw1', title: 'Zebrastreifen an der Bäckerei-Kreuzung', text: 'Genau dort queren morgens viele Kinder — ein Zebrastreifen mit Mittelinsel würde helfen.', category: 'Querung', author: 'Elternbeirat', supports: 168, gegen: 6, alternativen: 9, comments: 23 },
    { id: 'sw2', title: 'Tempo 30 vor der Schule', text: 'Zwischen 7 und 8 Uhr wird viel zu schnell gefahren. Tempo 30 im Schulbereich wäre wirksam.', category: 'Verkehr', author: 'Anwohner', supports: 142, gegen: 18, alternativen: 7, comments: 31 },
    { id: 'sw3', title: 'Schülerlotsen am Morgen', text: 'Ehrenamtliche Lotsen könnten die kritische Zeit morgens absichern.', category: 'Organisation', author: 'Lehrerin', supports: 88, gegen: 3, alternativen: 12, comments: 14 },
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
  'sicherer-schulweg': {
    question: 'Welche Maßnahme würde den Schulweg am meisten verbessern?',
    total: 472,
    options: [
      { label: 'Zebrastreifen mit Mittelinsel', percent: 57 },
      { label: 'Tempo 30 im Schulbereich', percent: 49 },
      { label: 'Schülerlotsen am Morgen', percent: 28 },
      { label: 'Bessere Beleuchtung', percent: 21 },
    ],
  },
  'buslinie-4': {
    question: 'Wie oft sollte die Linie 4 in der Hauptverkehrszeit fahren?',
    total: 543,
    options: [
      { label: 'Alle 10 Minuten', percent: 61 },
      { label: 'Alle 15 Minuten', percent: 27 },
      { label: 'Wie bisher (20 Min.)', percent: 12 },
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
  'buslinie-4': {
    teilnehmende: 543,
    aussagen: [
      { label: 'Takt alle 10 Minuten gewünscht', percent: 61 },
      { label: 'Spätere Fahrten am Abend', percent: 44 },
      { label: 'Bessere Anschlüsse am Bahnhof', percent: 38 },
    ],
    massnahmen: [
      { status: 'angenommen', text: '10-Minuten-Takt in der Hauptverkehrszeit ab Fahrplanwechsel' },
      { status: 'in_pruefung', text: 'Zusätzliche Abendfahrten bis 23 Uhr' },
      { status: 'abgelehnt', text: 'Nachtbus am Wochenende', grund: 'Aktuell nicht finanzierbar; Wiedervorlage im Rahmen des Mobilitätskonzepts 2035.' },
    ],
  },
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
