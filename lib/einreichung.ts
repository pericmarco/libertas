// Konstanten für den geführten Einreichungsflow
// (Umsetzungskonzept Einreichungsflow, Stand 05.07.2026)

export type Anliegenart = 'mangel' | 'wiederkehrend' | 'vorschlag'

export const ART_OPTIONS: { value: Anliegenart; label: string; desc: string }[] = [
  {
    value: 'mangel',
    label: 'Ein konkreter Schaden oder akuter Zustand',
    desc: 'Zum Beispiel: kaputte Laterne, Müllablagerung, Schlagloch, defekte Bank oder beschädigtes Schild.',
  },
  {
    value: 'wiederkehrend',
    label: 'Ein wiederkehrendes Problem an einem Ort',
    desc: 'Zum Beispiel: regelmäßige Vermüllung, Geruchsbelästigung, unsichere Haltestelle oder dauerhafte Lärmbelastung.',
  },
  {
    value: 'vorschlag',
    label: 'Ein grundsätzlicher Verbesserungsvorschlag',
    desc: 'Zum Beispiel: bessere Radwege, mehr Aufenthaltsqualität, mehr Sicherheit, bessere Beteiligung oder neue Angebote.',
  },
]

export const ART_LABELS: Record<string, string> = {
  mangel: 'Konkreter Schaden / akuter Zustand',
  wiederkehrend: 'Wiederkehrendes Problem',
  vorschlag: 'Verbesserungsvorschlag',
}

export const ORTSTYPEN = [
  { value: 'strasse',     label: 'Straße',            frage: 'Welche Straße?' },
  { value: 'platz',       label: 'Platz',             frage: 'Welcher Platz?' },
  { value: 'haltestelle', label: 'Haltestelle',       frage: 'Welche Haltestelle?' },
  { value: 'park',        label: 'Park / Grünfläche', frage: 'Welcher Park oder welche Grünfläche?' },
  { value: 'sonstig',     label: 'Sonstiger Ort',     frage: 'Beschreibe den Ort möglichst genau.' },
]

export const SCOPE_LABELS: Record<string, string> = {
  ort:                'Konkreter Ort',
  stadtteil:          'Ein Stadtteil',
  mehrere_orte:       'Mehrere Orte in einem Stadtteil',
  mehrere_stadtteile: 'Mehrere Stadtteile',
  ganz_koeln:         'Ganz Köln',
  unsicher:           'Unsicher',
}

// Themenbereiche mit Tags. Manche Tags gehören bewusst zu mehreren
// Bereichen (z. B. Schulweg, Lärm, Beleuchtung) — eine Forderung landet
// dann in allen zugehörigen Filtern.
export const THEMENBEREICHE: Record<string, string[]> = {
  'Verkehr & Mobilität': ['ÖPNV', 'Haltestelle', 'Radverkehr', 'Fußgänger', 'Parken', 'Stau', 'Baustelle', 'Schulweg', 'Verkehrssicherheit'],
  'Sicherheit & Ordnung': ['Angstraum', 'Beleuchtung', 'Kontrollen', 'Belästigung', 'Vandalismus', 'Drogen', 'nächtliche Störung', 'öffentliche Ordnung'],
  'Umwelt & Sauberkeit': ['Müll', 'Geruch', 'Reinigung', 'Grünfläche', 'Lärm', 'Hitze', 'Bäume', 'Luftqualität'],
  'Wohnen': ['Mieten', 'Wohnraum', 'Leerstand', 'Neubau', 'Nachbarschaft', 'Verdrängung', 'Wohnumfeld', 'Lärm'],
  'Soziales & Zusammenleben': ['Obdachlosigkeit', 'soziale Hilfe', 'Konflikte', 'Jugendliche', 'Familien', 'Integration', 'Teilhabe', 'öffentlicher Aufenthalt'],
  'Bildung & Betreuung': ['Schule', 'Kita', 'Schulweg', 'Betreuung', 'Ausstattung', 'Sicherheit', 'Freizeitangebote'],
  'Stadtentwicklung & öffentlicher Raum': ['Aufenthaltsqualität', 'Platzgestaltung', 'Barrierefreiheit', 'öffentlicher Raum', 'Nutzungskonflikt', 'Stadtmöbel', 'langfristige Planung', 'Beleuchtung'],
  'Sonstiges': ['Sonstiges', 'nicht sicher', 'betrifft mehrere Bereiche'],
}

export function themenForTags(tags: string[]): string[] {
  return Object.entries(THEMENBEREICHE)
    .filter(([, bereichTags]) => tags.some(t => bereichTags.includes(t)))
    .map(([bereich]) => bereich)
}

export const MAX_TAGS = 5

export const FREQUENZEN = ['Einmalig', 'Gelegentlich', 'Regelmäßig', 'Dauerhaft', 'Zu bestimmten Zeiten', 'Unsicher']

export const GRUPPEN = [
  'Anwohner', 'Fußgänger', 'Radfahrer', 'Fahrgäste', 'Kinder / Schüler',
  'ältere Menschen', 'Menschen mit Behinderung', 'Familien', 'Gewerbe', 'alle Bürger', 'unsicher',
]

export const AUSWIRKUNGEN = [
  'Sicherheit', 'Sauberkeit', 'Gesundheit / Geruch', 'Erreichbarkeit', 'Lärm',
  'Aufenthaltsqualität', 'Barrierefreiheit', 'soziale Konflikte', 'Lebensqualität', 'unsicher',
]

export const LOESUNGSRICHTUNGEN = [
  'Prüfen / untersuchen', 'Reinigen / instand halten', 'Reparieren', 'Kontrollieren / durchsetzen',
  'Baulich verbessern', 'Angebot ausbauen', 'Neue Regelung schaffen', 'Soziale Unterstützung einbinden',
  'Informieren / aufklären', 'Langfristig planen', 'Unsicher',
]

export const FEEDBACK_OPTIONS = [
  { value: 'stadt',    label: 'Stadt / Verwaltung', desc: 'Wenn es vor allem um Prüfung, Umsetzung, Reinigung, Reparatur, Kontrolle oder Verwaltungshandeln geht.' },
  { value: 'politik',  label: 'Politik',            desc: 'Wenn es um politische Unterstützung, Anträge, Entscheidungen oder öffentliche Positionierung geht.' },
  { value: 'beide',    label: 'Stadt und Politik',  desc: 'Wenn sowohl Verwaltung als auch politische Vertreter reagieren können sollen.' },
  { value: 'unsicher', label: 'Unsicher',           desc: 'Lybertas hilft, die passenden Stellen zuzuordnen.' },
]

export const FEEDBACK_LABELS: Record<string, string> = Object.fromEntries(
  FEEDBACK_OPTIONS.map(o => [o.value, o.label])
)
