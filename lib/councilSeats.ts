// Sitzverteilung kommunaler Räte — zentrale Datenquelle.
// Prozentwerte werden aus seats/totalSeats berechnet, nicht hier gepflegt.
// Bei der Kommunalwahl 2030 muss die Datenbasis aktualisiert werden.

export type CouncilSeatChild = {
  id: string
  name: string
  seats: number
  status: string
  email?: string
}

export type CouncilSeatSegment = {
  id: string
  name: string
  seats: number
  status: string
  color: string
  email?: string
  /** Nur beim Sammel-Segment „Weitere": die enthaltenen Akteure. */
  children?: CouncilSeatChild[]
}

export type CouncilSeatDistribution = {
  cityId: string
  title: string
  subtitle: string
  totalSeats: number
  sourceNote: string
  segments: CouncilSeatSegment[]
}

// Rat der Stadt Köln, Wahlperiode 2025–2030 (90 Sitze).
// Kompaktansicht: sechs große Fraktionen + Sammel-Segment „Weitere".
export const COLOGNE_COUNCIL: CouncilSeatDistribution = {
  cityId: 'koeln',
  title: 'Sitzverteilung im Rat Köln',
  subtitle: '90 Sitze · Wahlperiode 2025–2030',
  totalSeats: 90,
  sourceNote: 'Quelle: Stadt Köln, Sitzplan Rat, Stand April 2026',
  segments: [
    { id: 'gruene', name: 'GRÜNE',     seats: 22, status: 'Fraktion', color: '#64A12D', email: 'gruene-fraktion@stadt-koeln.de' },
    { id: 'cdu',    name: 'CDU',       seats: 18, status: 'Fraktion', color: '#111827', email: 'cdu-fraktion@stadt-koeln.de' },
    { id: 'spd',    name: 'SPD',       seats: 18, status: 'Fraktion', color: '#E3000F', email: 'spd-fraktion@stadt-koeln.de' },
    { id: 'linke',  name: 'DIE LINKE', seats: 10, status: 'Fraktion', color: '#BE3075', email: 'dielinke@stadt-koeln.de' },
    { id: 'afd',    name: 'AfD',       seats: 8,  status: 'Fraktion', color: '#009EE0', email: 'afd-fraktion@stadt-koeln.de' },
    { id: 'volt',   name: 'Volt',      seats: 5,  status: 'Fraktion', color: '#502379', email: 'volt@stadt-koeln.de' },
    {
      id: 'weitere',
      name: 'Weitere',
      seats: 9,
      status: 'Zusammenfassung kleinerer Akteure',
      color: '#9CA3AF',
      children: [
        { id: 'fdp',        name: 'FDP',                 seats: 3, status: 'Teil der Fraktion FDP/KSG', email: 'fdp-fraktion@stadt-koeln.de' },
        { id: 'ksg',        name: 'KSG',                 seats: 1, status: 'Teil der Fraktion FDP/KSG', email: 'fdp-fraktion@stadt-koeln.de' },
        { id: 'bsw',        name: 'BSW',                 seats: 2, status: 'Ratsgruppe',                email: 'bsw-ratsgruppe@stadt-koeln.de' },
        { id: 'die-partei', name: 'Die PARTEI',          seats: 2, status: 'Ratsgruppe',                email: 'diepartei@stadt-koeln.de' },
        { id: 'gut-klima',  name: 'GUT & KLIMA FREUNDE', seats: 1, status: 'Einzelmandat',              email: 'vorstand@gut-klimafreunde.koeln' },
      ],
    },
  ],
}
