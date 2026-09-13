// Fragen & Antworten: Bürger:innen stellen Fragen, die Verwaltung antwortet
// offiziell. Reine Demo-Daten (Frontend), fiktives Musterstadt.

export type QA = {
  id: string
  question: string
  author: string
  date: string
  upvotes: number
  answer?: { text: string; by: string; date: string }
}

export const FRAGEN: Record<string, QA[]> = {
  marktplatz: [
    {
      id: 'q1',
      question: 'Bleibt der Wochenmarkt während der Bauzeit erhalten?',
      author: 'anonym', date: '2026-09-05', upvotes: 47,
      answer: {
        text: 'Ja. Der Wochenmarkt findet während der Bauphase auf dem benachbarten Rathausplatz statt und kehrt nach Fertigstellung auf den neu gestalteten Marktplatz zurück.',
        by: 'Stadtplanungsamt', date: '2026-09-06',
      },
    },
    {
      id: 'q2',
      question: 'Wie viele Bäume sollen gepflanzt werden und welche Arten?',
      author: 'anonym', date: '2026-09-07', upvotes: 33,
      answer: {
        text: 'Vorgesehen sind rund 18 klimaresiliente, schattenspendende Bäume (u. a. Amberbaum und Hopfenbuche). Die genaue Auswahl wird mit dem Grünflächenamt abgestimmt.',
        by: 'Frau Dr. Neuhaus', date: '2026-09-08',
      },
    },
    {
      id: 'q3',
      question: 'Wird es weiterhin Parkplätze am Marktplatz geben?',
      author: 'anonym', date: '2026-09-09', upvotes: 28,
      answer: {
        text: 'Die oberirdischen Stellplätze am Platz entfallen zugunsten von Aufenthaltsfläche. Als Ersatz stehen das Parkhaus Rathaus (2 Min. Fußweg) und Kurzzeitparkplätze in den Seitenstraßen zur Verfügung.',
        by: 'Amt für Verkehr', date: '2026-09-10',
      },
    },
    {
      id: 'q4',
      question: 'Ist der neue Platz komplett barrierefrei?',
      author: 'anonym', date: '2026-09-11', upvotes: 19,
      // noch unbeantwortet — zeigt den „offen"-Zustand
    },
  ],
}
