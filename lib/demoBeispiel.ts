// ─────────────────────────────────────────────────────────────
// Gemeinsame Frontend-Demo-Daten für das Beispiel-Parteiprofil und
// die Beispiel-Politikerprofile. Rein statisch, keine Datenbank.
// Alle Angaben und Personen sind fiktiv (Marketing-/Vorschau-Zweck).
// ─────────────────────────────────────────────────────────────

import { Car, Home, Leaf, GraduationCap, Shield, ThumbsUp, Lightbulb, Megaphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const DEMO_PARTY = {
  name: 'Lybertas Beispielpartei',
  tagline: 'Fortschritt. Zusammenhalt. Köln.',
  description: 'Wir setzen uns für eine nachhaltige, gerechte und lebenswerte Zukunft für alle Kölner:innen ein.',
  founded: '2024',
  ausrichtung: 'Fortschrittlich',
  ziel: 'Ein starkes, modernes und gerechtes Köln.',
  position:
    'Unsere Stadt kann mehr. Wir setzen auf Innovation, Bildung und nachhaltige Stadtentwicklung. Bürgerbeteiligung und Transparenz sind für uns der Schlüssel für echte Veränderung.',
  tags: ['Fortschrittlich', 'Transparent', 'Bürgernah'],
}

export type DemoSurvey = { icon: LucideIcon; cat: string; q: string; n: string }
export const DEMO_SURVEYS: DemoSurvey[] = [
  { icon: Car, cat: 'Mobilität', q: 'Soll der ÖPNV in Köln kostenlos werden?', n: '1.234' },
  { icon: Home, cat: 'Wohnen', q: 'Wie wichtig ist bezahlbarer Wohnraum für dich?', n: '856' },
  { icon: Leaf, cat: 'Umwelt', q: 'Wie kann Köln bis 2030 klimaneutral werden?', n: '642' },
  { icon: GraduationCap, cat: 'Bildung', q: 'Brauchen wir mehr Ganztagsplätze an Schulen?', n: '498' },
  { icon: Shield, cat: 'Sicherheit', q: 'Wie sicher fühlst du dich abends in der Innenstadt?', n: '377' },
]

export const RESPONSE_META: Record<string, { label: string; badge: string; icon: LucideIcon }> = {
  unterstuetzung: { label: 'Unterstützung', badge: 'bg-green-50 text-green-600', icon: ThumbsUp },
  alternative:    { label: 'Alternative',   badge: 'bg-orange-50 text-orange-600', icon: Lightbulb },
  gegenargument:  { label: 'Gegenargument', badge: 'bg-red-50 text-red-500', icon: Megaphone },
}
export const DEMO_RESPONSES = [
  { kind: 'unterstuetzung', demand: 'Mehr sichere Radwege in der Innenstadt', text: 'Wir unterstützen diese Forderung voll und ganz — sichere Radwege sind zentral für eine moderne Verkehrswende.' },
  { kind: 'alternative', demand: 'Autofreie Innenstadt bis 2027', text: 'Das Ziel teilen wir, schlagen aber einen stufenweisen Weg mit besserem ÖPNV zuerst vor.' },
  { kind: 'gegenargument', demand: 'Abschaffung der Anwohnerparkzonen', text: 'Hier sehen wir das anders: Anwohnerparken schützt gerade Menschen ohne eigene Stellplätze.' },
]

export const DEMO_DEMANDS = [
  { title: 'Ausbau der Nachtbuslinien am Wochenende', cat: 'Verkehr & Mobilität', score: 128 },
  { title: 'Mehr Grünflächen und Bäume am Rheinufer', cat: 'Umwelt & Sauberkeit', score: 94 },
  { title: 'Kostenloses WLAN an allen Haltestellen', cat: 'Stadtentwicklung', score: 61 },
]

export type DemoSocial = { label: string; href: string }
export type DemoPolitician = {
  slug: string
  name: string
  role: string
  ort: string
  color: string
  photo: string
  funktion: string
  zustaendigkeit: string
  about: string
  dafuerStehe: string[]
  wahlprogramm: { title: string; points: string[] }[]
  kontakt: { email: string; website: string; socials: DemoSocial[] }
  verifiedDate: string
}

export const DEMO_POLITICIANS: DemoPolitician[] = [
  {
    slug: 'laura-becker',
    name: 'Laura Becker',
    role: 'Spitzenkandidatin',
    ort: 'Köln Innenstadt',
    color: 'bg-blue-50 text-blue-700',
    photo: '/demo/laura-becker.jpg',
    funktion: 'Spitzenkandidatin & Fraktionsvorsitzende',
    zustaendigkeit: 'Verkehr, Stadtentwicklung, Bürgerbeteiligung',
    about:
      'Laura Becker ist seit 2018 in der Kölner Kommunalpolitik aktiv. Als gelernte Stadtplanerin setzt sie sich besonders für eine lebenswerte, verkehrsberuhigte Innenstadt und für mehr direkte Beteiligung der Bürger:innen ein.',
    dafuerStehe: [
      'Sichere Rad- und Fußwege in der ganzen Stadt',
      'Bezahlbarer Wohnraum für alle Generationen',
      'Transparente Entscheidungen mit echter Bürgerbeteiligung',
    ],
    wahlprogramm: [
      { title: 'Mobilität', points: ['Lückenloses, sicheres Radwegenetz bis 2030', 'Günstigerer und dichterer ÖPNV-Takt', 'Autofreie Zonen rund um Schulen'] },
      { title: 'Wohnen', points: ['Mehr geförderter Wohnungsbau', 'Schutz vor Verdrängung in gewachsenen Vierteln'] },
      { title: 'Klima & Umwelt', points: ['Mehr Stadtgrün und Entsiegelung', 'Klimaneutrale Verwaltung bis 2030'] },
    ],
    kontakt: {
      email: 'laura.becker@beispielpartei.koeln',
      website: 'https://beispielpartei.koeln/laura-becker',
      socials: [
        { label: 'Instagram', href: '#' },
        { label: 'LinkedIn', href: '#' },
      ],
    },
    verifiedDate: '12. Juni 2026',
  },
  {
    slug: 'maximilian-berger',
    name: 'Maximilian Berger',
    role: 'Stadtrat',
    ort: 'Köln Ehrenfeld',
    color: 'bg-emerald-50 text-emerald-700',
    photo: '/demo/maximilian-berger.jpg',
    funktion: 'Stadtrat · Sprecher für Wirtschaft & Digitales',
    zustaendigkeit: 'Wirtschaft, Digitalisierung, Verwaltung',
    about:
      'Maximilian Berger bringt als ehemaliger Gründer unternehmerische Erfahrung in den Rat ein. Ihm ist wichtig, dass die Stadt digitaler, schneller und unternehmensfreundlicher wird — ohne den sozialen Zusammenhalt aus dem Blick zu verlieren.',
    dafuerStehe: [
      'Eine digitale, bürgernahe Verwaltung',
      'Gute Bedingungen für lokales Gewerbe und Start-ups',
      'Schnellere Genehmigungen und weniger Bürokratie',
    ],
    wahlprogramm: [
      { title: 'Digitalisierung', points: ['Alle Behördengänge online erledigen können', 'Offene Daten der Stadt für alle'] },
      { title: 'Wirtschaft', points: ['Förderung für kleine Betriebe und Handwerk', 'Bezahlbare Gewerbeflächen'] },
    ],
    kontakt: {
      email: 'max.berger@beispielpartei.koeln',
      website: 'https://beispielpartei.koeln/maximilian-berger',
      socials: [
        { label: 'LinkedIn', href: '#' },
        { label: 'Website', href: '#' },
      ],
    },
    verifiedDate: '3. Juni 2026',
  },
  {
    slug: 'sarah-klein',
    name: 'Sarah Klein',
    role: 'Stadträtin',
    ort: 'Köln Kalk',
    color: 'bg-purple-50 text-purple-700',
    photo: '/demo/sarah-klein.jpg',
    funktion: 'Stadträtin · Sprecherin für Soziales & Bildung',
    zustaendigkeit: 'Soziales, Bildung, Familie',
    about:
      'Sarah Klein arbeitet seit vielen Jahren in der sozialen Arbeit in Kalk. Sie kennt die Sorgen der Menschen vor Ort und setzt sich für gute Bildung, starke Familien und ein solidarisches Miteinander ein.',
    dafuerStehe: [
      'Gute Kitas und Schulen in jedem Stadtteil',
      'Unterstützung für Familien und Alleinerziehende',
      'Ein solidarisches Miteinander ohne Ausgrenzung',
    ],
    wahlprogramm: [
      { title: 'Bildung', points: ['Mehr Kita- und Ganztagsplätze', 'Sanierung maroder Schulen'] },
      { title: 'Soziales', points: ['Mehr bezahlbarer Wohnraum im Veedel', 'Ausbau der Jugend- und Familienzentren'] },
    ],
    kontakt: {
      email: 'sarah.klein@beispielpartei.koeln',
      website: 'https://beispielpartei.koeln/sarah-klein',
      socials: [
        { label: 'Instagram', href: '#' },
        { label: 'Website', href: '#' },
      ],
    },
    verifiedDate: '8. Juni 2026',
  },
]

export function getDemoPolitician(slug: string): DemoPolitician | undefined {
  return DEMO_POLITICIANS.find(p => p.slug === slug)
}

export function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('')
}
