'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, ChevronDown, ChevronRight, BadgeCheck, Calendar, Compass, Target, MapPin, Mail, ExternalLink } from 'lucide-react'
import {
  DEMO_PARTY, DEMO_SURVEYS, DEMO_RESPONSES, DEMO_DEMANDS, DEMO_POLITICIANS, RESPONSE_META,
  type DemoSurvey,
} from '@/lib/demoBeispiel'
import DemoSurveyModal from '@/components/DemoSurveyModal'

const TABS = ['Umfragen', 'Antworten auf Forderungen', 'Unsere Forderungen'] as const
type Tab = typeof TABS[number]

function BeispielTag() {
  return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Beispiel</span>
}

export default function BeispielPartei() {
  const [tab, setTab] = useState<Tab>('Umfragen')
  const [positionOpen, setPositionOpen] = useState(true)
  const [openSurvey, setOpenSurvey] = useState<DemoSurvey | null>(null)

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
              <Image src="/demo/partei-logo.png" alt="" width={64} height={64} className="h-16 w-16 shrink-0" unoptimized />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{DEMO_PARTY.name}</h1>
                  <BadgeCheck size={20} className="shrink-0 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{DEMO_PARTY.tagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{DEMO_PARTY.description}</p>
          </div>

          {/* Steckbrief */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Steckbrief</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Calendar, label: 'Gegründet', value: DEMO_PARTY.founded },
                { icon: Compass, label: 'Ausrichtung', value: DEMO_PARTY.ausrichtung },
                { icon: Target, label: 'Ziel', value: DEMO_PARTY.ziel },
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
              {positionOpen && <p className="mt-2 text-sm leading-relaxed text-gray-600">{DEMO_PARTY.position}</p>}
            </div>
          </div>

          {/* Kontakt — echte Lybertas-Kanäle */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Kontakt</h2>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">Echte Lybertas-Kanäle</span>
            </div>
            <a href="mailto:info@lybertas.de" className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail size={15} className="text-gray-400" /> info@lybertas.de
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/lybertas.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                Instagram @lybertas.de <ExternalLink size={12} />
              </a>
              <a
                href="https://www.linkedin.com/company/libertasde/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                LinkedIn <ExternalLink size={12} />
              </a>
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

          {tab === 'Umfragen' && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DEMO_SURVEYS.map(s => {
                const Icon = s.icon
                return (
                  <button
                    key={s.q}
                    onClick={() => setOpenSurvey(s)}
                    className="w-[230px] shrink-0 snap-start rounded-2xl border border-gray-100 bg-white p-5 text-left transition-all hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Icon size={14} className="text-gray-400" /> {s.cat}
                      </span>
                      <BeispielTag />
                    </div>
                    <div className="mt-3 min-h-[3.5rem] font-semibold leading-snug text-gray-900">{s.q}</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{s.n} Teilnehmer</span>
                      <ChevronRight size={15} className="text-gray-300" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {tab === 'Antworten auf Forderungen' && (
            <div className="mt-4 flex flex-col gap-3">
              {DEMO_RESPONSES.map(r => {
                const m = RESPONSE_META[r.kind]
                return (
                  <div key={r.demand} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.badge}`}>
                        <m.icon size={13} /> {m.label}
                      </span>
                      <BeispielTag />
                    </div>
                    <div className="mt-2 font-semibold text-gray-900">{r.demand}</div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{r.text}</p>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'Unsere Forderungen' && (
            <div className="mt-4 flex flex-col gap-3">
              {DEMO_DEMANDS.map(d => (
                <div key={d.title} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">{d.cat}</span>
                      <BeispielTag />
                    </div>
                    <div className="mt-0.5 font-semibold text-gray-900">{d.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{d.score} Relevanzpunkte</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300" />
                </div>
              ))}
            </div>
          )}

          {/* Unsere Vertreter — klickbar zu den Politikerprofilen */}
          <h2 className="mt-8 mb-3 text-base font-semibold text-gray-900">Unsere Vertreter</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DEMO_POLITICIANS.map(r => (
              <Link
                key={r.slug}
                href={`/politiker/beispiel/person/${r.slug}`}
                className="relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <span className="absolute right-3 top-3"><BeispielTag /></span>
                <Image src={r.photo} alt={r.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
                <div className="mt-3 flex items-center gap-1">
                  <span className="font-semibold text-gray-900">{r.name}</span>
                  <BadgeCheck size={14} className="shrink-0 text-blue-500" />
                </div>
                <div className="text-sm text-gray-500">{r.role}</div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} /> {r.ort}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
                  Profil ansehen <ChevronRight size={13} />
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Beispielprofil zu Demonstrationszwecken · alle Angaben und Personen sind fiktiv.
          </p>
        </div>
      </main>

      <DemoSurveyModal key={openSurvey?.q ?? "none"} survey={openSurvey} onClose={() => setOpenSurvey(null)} />
    </>
  )
}
