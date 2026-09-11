// Demo-Daten für den Verwaltungsbereich (Mängel, Beiträge, Aktivität).
// Rein fiktiv, reines Frontend.

export type MangelStatus = 'neu' | 'zugewiesen' | 'in_bearbeitung' | 'erledigt'
export type Mangel = {
  id: string
  title: string
  location: string
  category: string
  created: string
  department: string
  status: MangelStatus
}

export const MANGEL_STATUS: Record<MangelStatus, { label: string; badge: string }> = {
  neu:            { label: 'Neu',            badge: 'bg-amber-100 text-amber-700' },
  zugewiesen:     { label: 'Zugewiesen',     badge: 'bg-blue-100 text-blue-700' },
  in_bearbeitung: { label: 'In Bearbeitung', badge: 'bg-purple-100 text-purple-700' },
  erledigt:       { label: 'Erledigt',       badge: 'bg-green-100 text-green-700' },
}

export const MAENGEL: Mangel[] = [
  { id: 'M-2041', title: 'Schlagloch auf der Hauptstraße', location: 'Hauptstraße 42', category: 'Straße', created: '2026-09-09', department: 'Tiefbauamt', status: 'neu' },
  { id: 'M-2040', title: 'Defekte Straßenlaterne', location: 'Parkweg / Ecke Lindenallee', category: 'Beleuchtung', created: '2026-09-08', department: 'Stadtwerke', status: 'zugewiesen' },
  { id: 'M-2039', title: 'Überfüllter Mülleimer am Spielplatz', location: 'Stadtpark, Spielplatz Nord', category: 'Müll', created: '2026-09-08', department: 'Abfallwirtschaft', status: 'in_bearbeitung' },
  { id: 'M-2037', title: 'Zerbrochene Bank', location: 'Rheinpromenade', category: 'Grünanlage', created: '2026-09-06', department: 'Grünflächenamt', status: 'in_bearbeitung' },
  { id: 'M-2035', title: 'Verblasste Fußgänger-Markierung', location: 'Schulstraße', category: 'Verkehr', created: '2026-09-04', department: 'Tiefbauamt', status: 'erledigt' },
  { id: 'M-2032', title: 'Umgeknicktes Verkehrsschild', location: 'Bahnhofstraße 3', category: 'Beschilderung', created: '2026-09-02', department: 'Ordnungsamt', status: 'erledigt' },
]

export type QueueItem = {
  id: string
  process: string
  text: string
  position: 'unterstuetzung' | 'gegenargument' | 'alternative' | 'kommentar'
  author: string
  date: string
  status: 'offen' | 'freigegeben' | 'versteckt'
}

export const MODERATION_QUEUE: QueueItem[] = [
  { id: 'q1', process: 'Neugestaltung Marktplatz', text: 'Bitte an genügend Fahrradstellplätze denken!', position: 'alternative', author: 'anonym', date: '2026-09-10', status: 'offen' },
  { id: 'q2', process: 'Umbau Bahnhofsvorplatz', text: 'Die Taxistände sollten erhalten bleiben.', position: 'gegenargument', author: 'anonym', date: '2026-09-10', status: 'offen' },
  { id: 'q3', process: 'Neugestaltung Marktplatz', text: 'Toller Vorschlag, unbedingt umsetzen.', position: 'unterstuetzung', author: 'anonym', date: '2026-09-09', status: 'offen' },
]

export const ACTIVITY: { text: string; when: string }[] = [
  { text: '12 neue Beiträge zu „Neugestaltung Marktplatz"', when: 'vor 2 Std.' },
  { text: 'Neue Mangelmeldung: Schlagloch Hauptstraße', when: 'vor 3 Std.' },
  { text: '„Mobilitätskonzept 2035" erreicht 800 Teilnehmende', when: 'gestern' },
  { text: 'Offizielle Antwort veröffentlicht zu „Mehr Grün in der Innenstadt"', when: 'gestern' },
]
