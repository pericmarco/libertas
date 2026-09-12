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
  lng: number
  lat: number
  support: number   // Bestätigungen „auch betroffen" (für Relevanz-Sortierung)
}

export const MANGEL_STATUS: Record<MangelStatus, { label: string; badge: string; dot: string }> = {
  neu:            { label: 'Neu',            badge: 'bg-amber-100 text-amber-700',  dot: '#d97706' },
  zugewiesen:     { label: 'Zugewiesen',     badge: 'bg-blue-100 text-blue-700',    dot: '#2563eb' },
  in_bearbeitung: { label: 'In Bearbeitung', badge: 'bg-purple-100 text-purple-700', dot: '#7c3aed' },
  erledigt:       { label: 'Erledigt',       badge: 'bg-green-100 text-green-700',  dot: '#16a34a' },
}

export const MAENGEL: Mangel[] = [
  { id: 'M-2041', title: 'Schlagloch auf der Hauptstraße', location: 'Hauptstraße 42', category: 'Straße', created: '2026-09-09', department: 'Tiefbauamt', status: 'neu', lng: 6.837, lat: 51.099, support: 14 },
  { id: 'M-2040', title: 'Defekte Straßenlaterne', location: 'Parkweg / Ecke Lindenallee', category: 'Beleuchtung', created: '2026-09-08', department: 'Stadtwerke', status: 'zugewiesen', lng: 6.822, lat: 51.102, support: 6 },
  { id: 'M-2039', title: 'Überfüllter Mülleimer am Spielplatz', location: 'Stadtpark, Spielplatz Nord', category: 'Müll', created: '2026-09-08', department: 'Abfallwirtschaft', status: 'in_bearbeitung', lng: 6.834, lat: 51.104, support: 3 },
  { id: 'M-2038', title: 'Zugewachsener Radweg', location: 'Uferstraße, Höhe Nr. 18', category: 'Grünanlage', created: '2026-09-07', department: 'Grünflächenamt', status: 'neu', lng: 6.826, lat: 51.096, support: 9 },
  { id: 'M-2037', title: 'Zerbrochene Bank', location: 'Rheinpromenade', category: 'Grünanlage', created: '2026-09-06', department: 'Grünflächenamt', status: 'in_bearbeitung', lng: 6.829, lat: 51.107, support: 2 },
  { id: 'M-2036', title: 'Ampel schaltet zu kurz', location: 'Kreuzung Bahnhofstraße / Ring', category: 'Verkehr', created: '2026-09-05', department: 'Amt für Verkehr', status: 'zugewiesen', lng: 6.840, lat: 51.101, support: 21 },
  { id: 'M-2035', title: 'Verblasste Fußgänger-Markierung', location: 'Schulstraße', category: 'Verkehr', created: '2026-09-04', department: 'Tiefbauamt', status: 'erledigt', lng: 6.831, lat: 51.094, support: 5 },
  { id: 'M-2032', title: 'Umgeknicktes Verkehrsschild', location: 'Bahnhofstraße 3', category: 'Beschilderung', created: '2026-09-02', department: 'Ordnungsamt', status: 'erledigt', lng: 6.819, lat: 51.100, support: 1 },
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
