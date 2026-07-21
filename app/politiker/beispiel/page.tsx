'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import {
  ChevronLeft, ChevronDown, ChevronRight, BadgeCheck, Calendar, Compass, Target,
  MapPin, Car, Home, Leaf, GraduationCap, Shield, ThumbsUp, Lightbulb, Megaphone,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Frontend-only Demo-Parteiprofil ("Lybertas Beispielpartei").
// Rein statische Beispieldaten — keine Datenbank. Dient dazu,
// Parteien zu zeigen, wie ihr Profil auf Lybertas aussehen könnte.
// ─────────────────────────────────────────────────────────────

const PARTY = {
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

const SURVEYS = [
  { icon: Car, cat: 'Mobilität', q: 'Soll der ÖPNV in Köln kostenlos werden?', n: '1.234' },
  { icon: Home, cat: 'Wohnen', q: 'Wie wichtig ist bezahlbarer Wohnraum für dich?', n: '856' },
  { icon: Leaf, cat: 'Umwelt', q: 'Wie kann Köln bis 2030 klimaneutral werden?', n: '642' },
  { icon: GraduationCap, cat: 'Bildung', q: 'Brauchen wir mehr Ganztagsplätze an Schulen?', n: '498' },
  { icon: Shield, cat: 'Sicherheit', q: 'Wie sicher fühlst du dich abends in der Innenstadt?', n: '377' },
]

const RESPONSES = [
  { kind: 'unterstuetzung', demand: 'Mehr sichere Radwege in der Innenstadt', text: 'Wir unterstützen diese Forderung voll und ganz — sichere Radwege sind zentral für eine moderne Verkehrswende.' },
  { kind: 'alternative', demand: 'Autofreie Innenstadt bis 2027', text: 'Das Ziel teilen wir, schlagen aber einen stufenweisen Weg mit besserem ÖPNV zuerst vor.' },
  { kind: 'gegenargument', demand: 'Abschaffung der Anwohnerparkzonen', text: 'Hier sehen wir das anders: Anwohnerparken schützt gerade Menschen ohne eigene Stellplätze.' },
]

const OWN_DEMANDS = [
  { title: 'Ausbau der Nachtbuslinien am Wochenende', cat: 'Verkehr & Mobilität', score: 128 },
  { title: 'Mehr Grünflächen und Bäume am Rheinufer', cat: 'Umwelt & Sauberkeit', score: 94 },
  { title: 'Kostenloses WLAN an allen Haltestellen', cat: 'Stadtentwicklung', score: 61 },
]

const REPS = [
  { name: 'Laura Becker', role: 'Spitzenkandidatin', ort: 'Köln Innenstadt', color: 'bg-blue-50 text-blue-700' },
  { name: 'Maximilian Berger', role: 'Stadtrat', ort: 'Köln Ehrenfeld', color: 'bg-emerald-50 text-emerald-700' },
  { name: 'Sarah Klein', role: 'Stadträtin', ort: 'Köln Kalk', color: 'bg-purple-50 text-purple-700' },
]

const RESPONSE_META: Record<string, { label: string; badge: string; icon: typeof ThumbsUp }> = {
  unterstuetzung: { label: 'Unterstützung', badge: 'bg-green-50 text-green-600', icon: ThumbsUp },
  alternative:    { label: 'Alternative',   badge: 'bg-orange-50 text-orange-600', icon: Lightbulb },
  gegenargument:  { label: 'Gegenargument', badge: 'bg-red-50 text-red-500', icon: Megaphone },
}

const TABS = ['Umfragen', 'Antworten auf Forderungen', 'Unsere Forderungen'] as const
type Tab = typeof TABS[number]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('')
}

export default function BeispielPartei() {
  const [tab, setTab] = useState<Tab>('Umfragen')
  const [positionOpen, setPositionOpen] = useState(true)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/politiker" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={15} /> Alle Parteien
          </Link>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            Beispielprofil · so könnte eure Partei aussehen
          </div>

          {/* Hero */}
          <div className="rounded-2xl bg-blue-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Image src="/logo.svg" alt="" width={44} height={44} unoptimized />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{PARTY.name}</h1>
                  <BadgeCheck size={20} className="shrink-0 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{PARTY.tagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{PARTY.description}</p>
          </div>

          {/* Steckbrief */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Steckbrief</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Calendar, label: 'Gegründet', value: PARTY.founded },
                { icon: Compass, label: 'Ausrichtung', value: PARTY.ausrichtung },
                { icon: Target, label: 'Ziel', value: PARTY.ziel },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-sm font-medium text-gray-900 leading-snug">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <button onClick={() => setPositionOpen(o => !o)} className="flex w-full items-center justify-between gap-2 text-left">
                <span className="text-base font-semibold text-gray-900">Position für Köln</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${positionOpen ? 'rotate-180' : ''}`} />
              </button>
              {positionOpen && <p className="mt-2 text-sm leading-relaxed text-gray-600">{PARTY.position}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-5 border-b border-gray-100">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                  tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab: Umfragen */}
          {tab === 'Umfragen' && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SURVEYS.map(({ icon: Icon, cat, q, n }) => (
                <div key={q} className="w-[230px] shrink-0 snap-start rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Icon size={14} className="text-gray-400" /> {cat}
                    </span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">Aktiv</span>
                  </div>
                  <div className="mt-3 min-h-[3.5rem] font-semibold leading-snug text-gray-900">{q}</div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>{n} Teilnehmer</span>
                    <ChevronRight size={15} className="text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Antworten auf Forderungen */}
          {tab === 'Antworten auf Forderungen' && (
            <div className="mt-4 flex flex-col gap-3">
              {RESPONSES.map(r => {
                const m = RESPONSE_META[r.kind]
                return (
                  <div key={r.demand} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.badge}`}>
                      <m.icon size={13} /> {m.label}
                    </span>
                    <div className="mt-2 font-semibold text-gray-900">{r.demand}</div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{r.text}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab: Unsere Forderungen */}
          {tab === 'Unsere Forderungen' && (
            <div className="mt-4 flex flex-col gap-3">
              {OWN_DEMANDS.map(d => (
                <div key={d.title} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-500">{d.cat}</div>
                    <div className="mt-0.5 font-semibold text-gray-900">{d.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{d.score} Relevanzpunkte</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300" />
                </div>
              ))}
            </div>
          )}

          {/* Unsere Vertreter */}
          <h2 className="mt-8 mb-3 text-base font-semibold text-gray-900">Unsere Vertreter</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {REPS.map(r => (
              <div key={r.name} className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${r.color}`}>
                  {initials(r.name)}
                </div>
                <div className="mt-3 font-semibold text-gray-900">{r.name}</div>
                <div className="text-sm text-gray-500">{r.role}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} /> {r.ort}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Beispielprofil zu Demonstrationszwecken · alle Angaben und Personen sind fiktiv.
          </p>
        </div>
      </main>
    </>
  )
}
