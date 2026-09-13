// Kartendialog: verortete Bürgerbeiträge für das „Karte"-Modul einer
// Beteiligung. Bürger:innen setzen einen Punkt auf die Karte, wählen eine
// Art und schreiben einen kurzen Hinweis; andere können unterstützen.
// Reine Demo-Daten (Frontend). Fiktives Musterstadt.

import type { LngLat } from '@/components/MapView'

export type MapCategory = 'vorschlag' | 'problem' | 'lob'

export const MAP_CATEGORY: Record<MapCategory, { label: string; emoji: string; color: string }> = {
  // Legende gemäß Design: eigene Farben nur mit Legende (hier gegeben).
  vorschlag: { label: 'Vorschlag', emoji: '💡', color: '#2563EB' },
  problem:   { label: 'Problem',   emoji: '⚠️', color: '#EA580C' },
  lob:       { label: 'Gefällt mir', emoji: '👍', color: '#16A34A' },
}

export type MapContribution = {
  id: string
  lng: number
  lat: number
  category: MapCategory
  text: string
  author: string
  supports: number
}

// Kartenmittelpunkt je Verfahren (fiktiv, um 6.83 / 51.10).
export const MAP_CENTER: Record<string, LngLat> = {
  marktplatz: { lng: 6.826, lat: 51.098 },
  bahnhofsvorplatz: { lng: 6.831, lat: 51.101 },
  'mehr-gruen-innenstadt': { lng: 6.828, lat: 51.099 },
  'sitzbaenke-stadtpark': { lng: 6.834, lat: 51.104 },
  'sicherer-schulweg': { lng: 6.831, lat: 51.094 },
}

// Kurzer, verfahrensspezifischer Aufruf über der Karte.
export const MAP_PROMPT: Record<string, string> = {
  marktplatz: 'Wo wünschen Sie sich was auf dem Marktplatz? Setzen Sie einen Punkt und sagen Sie uns, worum es geht.',
  bahnhofsvorplatz: 'Wo klappt es am Bahnhofsvorplatz gut – und wo nicht? Markieren Sie die Stelle.',
  'mehr-gruen-innenstadt': 'Wo soll neues Grün entstehen? Markieren Sie den Ort und begründen Sie kurz.',
  'sitzbaenke-stadtpark': 'Wo fehlt Ihnen eine Sitzbank im Stadtpark? Setzen Sie einen Punkt.',
  'sicherer-schulweg': 'Wo ist der Schulweg gefährlich? Markieren Sie die Stelle und beschreiben Sie das Problem.',
}

export const MAP_CONTRIB: Record<string, MapContribution[]> = {
  marktplatz: [
    { id: 'mk1', lng: 6.8262, lat: 51.0985, category: 'vorschlag', text: 'Hier wäre Platz für schattenspendende Bäume und Bänke.', author: 'anonym', supports: 34 },
    { id: 'mk2', lng: 6.8256, lat: 51.0978, category: 'problem', text: 'Der Durchgangsverkehr an dieser Ecke ist laut und gefährlich.', author: 'anonym', supports: 21 },
    { id: 'mk3', lng: 6.8268, lat: 51.0982, category: 'lob', text: 'Der Wochenmarkt hier ist toll – bitte unbedingt erhalten.', author: 'anonym', supports: 48 },
    { id: 'mk4', lng: 6.8251, lat: 51.0989, category: 'vorschlag', text: 'Ein kleiner Brunnen als Treffpunkt wäre schön.', author: 'anonym', supports: 12 },
  ],
  bahnhofsvorplatz: [
    { id: 'bh1', lng: 6.8312, lat: 51.1014, category: 'problem', text: 'Fahrräder stehen kreuz und quer – überdachte Stellplätze fehlen.', author: 'anonym', supports: 27 },
    { id: 'bh2', lng: 6.8305, lat: 51.1006, category: 'problem', text: 'Der Übergang zur Bushaltestelle ist nicht barrierefrei.', author: 'anonym', supports: 19 },
    { id: 'bh3', lng: 6.8318, lat: 51.1009, category: 'vorschlag', text: 'Mehr Grün und Sitzgelegenheiten beim Ausgang.', author: 'anonym', supports: 15 },
  ],
  'mehr-gruen-innenstadt': [
    { id: 'gr1', lng: 6.8281, lat: 51.0994, category: 'vorschlag', text: 'Diesen Parkplatz teilweise entsiegeln und begrünen.', author: 'anonym', supports: 41 },
    { id: 'gr2', lng: 6.8274, lat: 51.0988, category: 'vorschlag', text: 'Baumscheiben an der Hauptstraße bepflanzen.', author: 'anonym', supports: 29 },
    { id: 'gr3', lng: 6.8288, lat: 51.0996, category: 'lob', text: 'Die kleine Grünfläche hier wird viel genutzt – super!', author: 'anonym', supports: 18 },
  ],
  'sitzbaenke-stadtpark': [
    { id: 'sb1', lng: 6.8341, lat: 51.1044, category: 'vorschlag', text: 'Am Teich fehlt eine Bank mit Blick aufs Wasser.', author: 'anonym', supports: 33 },
    { id: 'sb2', lng: 6.8335, lat: 51.1037, category: 'vorschlag', text: 'Beim Spielplatz eine Bank für wartende Eltern.', author: 'anonym', supports: 26 },
    { id: 'sb3', lng: 6.8347, lat: 51.1041, category: 'problem', text: 'Die alte Bank hier ist morsch und wackelt.', author: 'anonym', supports: 9 },
  ],
  'sicherer-schulweg': [
    { id: 'sw1', lng: 6.8312, lat: 51.0942, category: 'problem', text: 'Kein Zebrastreifen – Kinder queren zwischen parkenden Autos.', author: 'anonym', supports: 52 },
    { id: 'sw2', lng: 6.8305, lat: 51.0948, category: 'problem', text: 'Autos fahren hier viel zu schnell. Tempo 30 nötig.', author: 'anonym', supports: 44 },
    { id: 'sw3', lng: 6.8319, lat: 51.0938, category: 'vorschlag', text: 'Eine Querungshilfe mit Mittelinsel wäre ideal.', author: 'anonym', supports: 31 },
  ],
}
