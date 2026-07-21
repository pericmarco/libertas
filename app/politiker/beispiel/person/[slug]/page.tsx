'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import {
  ChevronLeft, ChevronDown, ChevronRight, BadgeCheck, ShieldCheck, Info, MapPin,
  Mail, Globe, ExternalLink, FileText, Briefcase, Quote, Target,
} from 'lucide-react'
import {
  getDemoPolitician, DEMO_SURVEYS, DEMO_RESPONSES, DEMO_DEMANDS, RESPONSE_META,
} from '@/lib/demoBeispiel'

const TABS = ['Umfragen', 'Antworten auf Forderungen', 'Meine Forderungen'] as const
type Tab = typeof TABS[number]

function BeispielTag() {
  return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Beispiel</span>
}

export default function BeispielPolitiker() {
  const { slug } = useParams<{ slug: string }>()
  const p = getDemoPolitician(slug)
  const [tab, setTab] = useState<Tab>('Umfragen')
  const [programOpen, setProgramOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  if (!p) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-500">
            <p>Dieses Beispielprofil gibt es nicht.</p>
            <Link href="/politiker/beispiel" className="mt-4 inline-block text-blue-600 hover:underline">Zum Beispiel-Parteiprofil</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/politiker/beispiel" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={15} /> Zurück zum Parteiprofil
          </Link>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            Beispielprofil · so könnte dein Profil aussehen
          </div>

          {/* Hero */}
          <div className="rounded-2xl bg-blue-50 p-6">
            <div className="flex items-center gap-4">
              <Image src={p.photo} alt={p.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" unoptimized />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{p.name}</h1>
                  <BadgeCheck size={20} className="shrink-0 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{p.role}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {p.ort}
                </div>
              </div>
            </div>
          </div>

          {/* Verifiziert-Hinweis */}
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-blue-800">
                  Angaben von der Person freigegeben und von Lybertas verifiziert
                  <button onClick={() => setInfoOpen(o => !o)} aria-label="Was bedeutet das?" className="text-blue-500 hover:text-blue-700">
                    <Info size={14} />
                  </button>
                </div>
                <div className="text-xs text-blue-600/80 mt-0.5">Verifiziert am {p.verifiedDate}</div>
                {infoOpen && (
                  <p className="mt-2 text-xs leading-relaxed text-blue-700/90">
                    Die Person hat diese Angaben selbst freigegeben. Lybertas hat die Identität und Funktion geprüft —
                    inhaltliche Aussagen bleiben die Meinung der Person.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Funktion & Zuständigkeit */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Funktion & Zuständigkeit</h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Briefcase size={16} /></div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Funktion</div>
                  <div className="text-sm font-medium text-gray-900 leading-snug">{p.funktion}</div>
                </div>
              </div>
              <div className="flex flex-1 items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Target size={16} /></div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Zuständigkeit</div>
                  <div className="text-sm font-medium text-gray-900 leading-snug">{p.zustaendigkeit}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Über mich */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Über {p.name.split(' ')[0]}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.about}</p>
          </div>

          {/* Dafür stehe ich */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">Dafür stehe ich</h2>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {p.dafuerStehe.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mein Wahlprogramm (klickbar) */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <button onClick={() => setProgramOpen(o => !o)} className="flex w-full items-center justify-between gap-2 text-left">
              <span className="inline-flex items-center gap-2 text-base font-semibold text-gray-900">
                <FileText size={16} className="text-gray-400" /> Mein Wahlprogramm
              </span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${programOpen ? 'rotate-180' : ''}`} />
            </button>
            {!programOpen && <p className="mt-1 text-xs text-gray-400">Antippen, um das vollständige Programm zu lesen.</p>}
            {programOpen && (
              <div className="mt-4 flex flex-col gap-5">
                {p.wahlprogramm.map(section => (
                  <div key={section.title}>
                    <div className="text-sm font-semibold text-gray-900">{section.title}</div>
                    <ul className="mt-2 flex flex-col gap-2">
                      {section.points.map(pt => (
                        <li key={pt} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kontakt */}
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">Kontakt</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              <a href={`mailto:${p.kontakt.email}`} className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <Mail size={15} className="text-gray-400" /> {p.kontakt.email}
              </a>
              <a href={p.kontakt.website} className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
                <Globe size={15} className="text-gray-400" /> {p.kontakt.website.replace('https://', '')}
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.kontakt.socials.map(s => (
                <a key={s.label} href={s.href} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  {s.label} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Tabs (wie beim Parteiprofil) */}
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
              {DEMO_SURVEYS.map(({ icon: Icon, cat, q, n }) => (
                <div key={q} className="w-[230px] shrink-0 snap-start rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Icon size={14} className="text-gray-400" /> {cat}
                    </span>
                    <BeispielTag />
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

          {tab === 'Meine Forderungen' && (
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

          <p className="mt-8 text-center text-xs text-gray-400">
            Beispielprofil zu Demonstrationszwecken · alle Angaben und Personen sind fiktiv.
          </p>
        </div>
      </main>
    </>
  )
}
