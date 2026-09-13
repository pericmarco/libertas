// Dokumenten-Dialog: Bürger:innen kommentieren einzelne Abschnitte eines
// Verwaltungsdokuments. Reine Demo-Daten (Frontend), fiktives Musterstadt.

export type DocComment = { id: string; author: string; date: string; text: string }
export type DocSection = { id: string; nr: string; title: string; summary: string; comments: DocComment[] }
export type DocFile = { title: string; kind: string; pages: number; size: string }

export type DocumentDialog = {
  files: DocFile[]
  intro: string
  sections: DocSection[]
}

export const DOCUMENTS: Record<string, DocumentDialog> = {
  'mobilitaet-2035': {
    files: [
      { title: 'Entwurf Mobilitätskonzept 2035', kind: 'PDF', pages: 84, size: '6,2 MB' },
      { title: 'Verkehrsgutachten 2025 (Anlage)', kind: 'PDF', pages: 41, size: '3,1 MB' },
    ],
    intro: 'Lesen Sie den Entwurf abschnittsweise und kommentieren Sie gezielt die Stellen, zu denen Sie eine Rückmeldung haben. Ihre Hinweise fließen in die Überarbeitung ein.',
    sections: [
      {
        id: 's1', nr: '1', title: 'Einleitung & Ziele',
        summary: 'Leitbild, übergeordnete Ziele und der Rahmen des Mobilitätskonzepts bis 2035.',
        comments: [
          { id: 'c1', author: 'anonym', date: '2026-09-06', text: 'Gutes Leitbild – die Ziele sollten aber messbar mit Jahreszahlen hinterlegt werden.' },
        ],
      },
      {
        id: 's2', nr: '2', title: 'Radverkehr',
        summary: 'Ausbau des Radwegenetzes, Radschnellwege, sichere Kreuzungen und Abstellanlagen.',
        comments: [
          { id: 'c2', author: 'anonym', date: '2026-09-08', text: 'Der Lückenschluss zwischen Nordstadt und Zentrum fehlt in der Karte auf S. 23.' },
          { id: 'c3', author: 'anonym', date: '2026-09-09', text: 'Bitte überdachte Abstellanlagen am Bahnhof mit aufnehmen.' },
        ],
      },
      {
        id: 's3', nr: '3', title: 'ÖPNV & Busnetz',
        summary: 'Taktverdichtung, neue Linienführung, Elektrifizierung der Busflotte.',
        comments: [
          { id: 'c4', author: 'anonym', date: '2026-09-07', text: 'Die Linie 4 braucht abends einen späteren letzten Bus – bitte prüfen.' },
        ],
      },
      {
        id: 's4', nr: '4', title: 'Parkraum & ruhender Verkehr',
        summary: 'Bewirtschaftung, Quartiersparken und Umwandlung von Stellflächen.',
        comments: [],
      },
      {
        id: 's5', nr: '5', title: 'Fußverkehr & Barrierefreiheit',
        summary: 'Gehwegqualität, Querungen, Barrierefreiheit und Aufenthaltsqualität.',
        comments: [
          { id: 'c5', author: 'anonym', date: '2026-09-05', text: 'An der Schulstraße sind die Bordsteine zu hoch für Rollstühle und Kinderwagen.' },
        ],
      },
      {
        id: 's6', nr: '6', title: 'Umsetzung & Zeitplan',
        summary: 'Maßnahmenpakete, Prioritäten, Kosten und der Zeithorizont bis 2035.',
        comments: [],
      },
    ],
  },
}
