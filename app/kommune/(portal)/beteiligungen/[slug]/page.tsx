'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ChevronLeft, Building2, UserRound, MapPin, CalendarClock, Layers, MessageSquareHeart, Plus,
} from 'lucide-react'
import { getProcess, STATUS_META, REACTION_LABEL, daysLeft, formatDate, type ModuleType, type ReactionMode, type ParticipationProcess } from '@/lib/kommune/demo'
import { IDEAS, POLLS, VARIANTS, EVENTS, RESULTS, type Idea } from '@/lib/kommune/detail'
import IdeaCard from '@/components/kommune/IdeaCard'
import KartendialogTab from '@/components/kommune/KartendialogTab'

const TAB_LABEL: Record<ModuleType, string> = {
  information: 'Überblick', ideen: 'Mitmachen', karte: 'Karte', umfrage: 'Umfrage',
  varianten: 'Varianten', fragen: 'Fragen', buergerbudget: 'Bürgerbudget',
  dokument: 'Dokumente', termine: 'Termine', ergebnisse: 'Ergebnisse',
}

export default function ProcessDetail() {
  const { slug } = useParams<{ slug: string }>()
  const p = getProcess(slug)
  const [tab, setTab] = useState<ModuleType>('information')

  if (!p) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-gray-500">
        <p>Dieses Beteiligungsverfahren gibt es nicht.</p>
        <Link href="/beteiligungen" className="mt-3 inline-block text-blue-600 hover:underline">Zur Übersicht</Link>
      </main>
    )
  }

  const st = STATUS_META[p.status]
  const left = daysLeft(p.end)
  const meta = [
    { icon: Building2, label: 'Zuständig', value: p.department },
    { icon: UserRound, label: 'Ansprechpartner:in', value: p.contact },
    { icon: MapPin, label: 'Ort', value: p.district },
    { icon: CalendarClock, label: 'Zeitraum', value: `${formatDate(p.start)}${p.end ? ' – ' + formatDate(p.end) : ''}` },
    { icon: Layers, label: 'Beteiligungsstufe', value: p.level },
    { icon: MessageSquareHeart, label: 'Reaktionen', value: REACTION_LABEL[p.reactionMode] },
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/beteiligungen" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={15} /> Alle Beteiligungen
      </Link>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {p.image && (
          <div className="relative h-52 w-full sm:h-64">
            <Image src={p.image} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
          </div>
        )}
        <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${p.accent}`}>{p.emoji}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          {left != null && left > 0 && <span className="text-xs text-gray-400">noch {left} {left === 1 ? 'Tag' : 'Tage'}</span>}
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900">{p.title}</h1>
        <p className="mt-1 text-gray-500">{p.subtitle}</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {meta.map(m => (
            <div key={m.label} className="flex items-start gap-2.5">
              <m.icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400">{m.label}</div>
                <div className="text-sm font-medium text-gray-900">{m.value}</div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Modul-Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {p.modules.map(m => (
          <button
            key={m}
            onClick={() => setTab(m)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3.5 pb-2.5 pt-1 text-sm font-medium transition-colors ${
              tab === m ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {TAB_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'information' && <InfoTab p={p} />}
        {tab === 'ideen' && <IdeenTab slug={p.slug} mode={p.reactionMode} />}
        {tab === 'umfrage' && <UmfrageTab slug={p.slug} />}
        {tab === 'karte' && <KartendialogTab slug={p.slug} />}
        {tab === 'varianten' && <VariantenTab slug={p.slug} />}
        {tab === 'termine' && <TermineTab slug={p.slug} />}
        {tab === 'ergebnisse' && <ErgebnisseTab slug={p.slug} status={p.status} />}
        {(tab === 'fragen' || tab === 'buergerbudget' || tab === 'dokument') && (
          <SoonTab label={TAB_LABEL[tab]} />
        )}
      </div>
    </main>
  )
}

function InfoTab({ p }: { p: ParticipationProcess }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Worum geht es?</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.description}</p>
      <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
        So können Sie sich beteiligen: {p.modules.filter(m => m !== 'information' && m !== 'ergebnisse').map(m => TAB_LABEL[m]).join(' · ')}.
      </div>
    </div>
  )
}

function IdeenTab({ slug, mode }: { slug: string; mode: ReactionMode }) {
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS[slug] ?? [])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  function submit() {
    if (title.trim().length < 3) return
    setIdeas(prev => [{ id: 'neu-' + Date.now(), title: title.trim(), text: text.trim(), category: 'Neu', author: 'Sie (Demo)', supports: 0, gegen: 0, alternativen: 0, comments: 0 }, ...prev])
    setTitle(''); setText(''); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setOpen(o => !o)} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
        <Plus size={16} /> Idee einbringen
      </button>
      {open && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel deiner Idee" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Beschreibe deine Idee kurz…" className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div className="mt-2 flex items-center gap-3">
            <button onClick={submit} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Einreichen</button>
            <span className="text-xs text-gray-400">Demo · wird nicht gespeichert</span>
          </div>
        </div>
      )}
      {ideas.map(i => <IdeaCard key={i.id} idea={i} mode={mode} />)}
    </div>
  )
}

function UmfrageTab({ slug }: { slug: string }) {
  const poll = POLLS[slug]
  if (!poll) return <SoonTab label="Umfrage" />
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">{poll.question}</h2>
      <p className="mt-0.5 text-xs text-gray-400">{poll.total.toLocaleString('de-DE')} Teilnehmende · {poll.multi ? 'Mehrfachauswahl' : 'Einfachauswahl'}</p>
      <div className="mt-5 flex flex-col gap-3">
        {poll.options.map(o => (
          <div key={o.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">{o.label}</span>
              <span className="text-gray-500 tabular-nums">{o.percent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${o.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VariantenTab({ slug }: { slug: string }) {
  const variants = VARIANTS[slug]
  const [pick, setPick] = useState<string | null>(null)
  if (!variants) return <SoonTab label="Variantenvergleich" />
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {variants.map(v => (
        <div key={v.id} className={`flex flex-col rounded-2xl border bg-white p-5 transition-colors ${pick === v.id ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-100'}`}>
          <div className="text-2xl">{v.emoji}</div>
          <h3 className="mt-2 font-semibold text-gray-900">{v.name}</h3>
          <p className="mt-1 text-sm text-gray-600">{v.summary}</p>
          <div className="mt-3 space-y-1">
            {v.pros.map(x => <div key={x} className="flex items-start gap-1.5 text-xs text-green-700"><span>+</span>{x}</div>)}
            {v.cons.map(x => <div key={x} className="flex items-start gap-1.5 text-xs text-orange-700"><span>−</span>{x}</div>)}
          </div>
          <button onClick={() => setPick(v.id)} className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${pick === v.id ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:border-blue-300'}`}>
            {pick === v.id ? 'Bevorzugt ✓' : 'Diese Variante bevorzugen'}
          </button>
          <div className="mt-2 text-center text-xs text-gray-400">{(v.votes + (pick === v.id ? 1 : 0)).toLocaleString('de-DE')} Stimmen</div>
        </div>
      ))}
    </div>
  )
}

function TermineTab({ slug }: { slug: string }) {
  const events = EVENTS[slug]
  if (!events?.length) return <SoonTab label="Termine" />
  return (
    <div className="flex flex-col gap-3">
      {events.map(e => (
        <div key={e.title} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <span className="text-[10px] uppercase">{new Date(e.date).toLocaleDateString('de-DE', { month: 'short' })}</span>
            <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{e.kind}</span>
              <span className="text-xs text-gray-400">{e.time} Uhr</span>
            </div>
            <div className="mt-0.5 font-semibold text-gray-900">{e.title}</div>
            <div className="text-sm text-gray-500">{e.place}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ErgebnisseTab({ slug, status }: { slug: string; status: string }) {
  const r = RESULTS[slug]
  if (!r) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
        {status === 'beteiligung_laeuft'
          ? 'Die Beteiligung läuft noch — die Ergebnisse werden nach Abschluss ausgewertet und hier veröffentlicht.'
          : 'Für dieses Verfahren liegen noch keine Ergebnisse vor.'}
      </div>
    )
  }
  const statusStyle: Record<string, string> = { angenommen: 'bg-green-50 text-green-700 border-green-100', in_pruefung: 'bg-amber-50 text-amber-700 border-amber-100', abgelehnt: 'bg-red-50 text-red-600 border-red-100' }
  const statusLabel: Record<string, string> = { angenommen: 'Angenommen', in_pruefung: 'In Prüfung', abgelehnt: 'Nicht angenommen' }
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Das haben Sie uns gesagt</h2>
        <p className="mt-0.5 text-xs text-gray-400">{r.teilnehmende.toLocaleString('de-DE')} Teilnehmende</p>
        <div className="mt-4 flex flex-col gap-3">
          {r.aussagen.map(a => (
            <div key={a.label}>
              <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-700">{a.label}</span><span className="tabular-nums text-gray-500">{a.percent}%</span></div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${a.percent}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900">Das macht die Stadt daraus</h2>
        <div className="mt-4 flex flex-col gap-3">
          {r.massnahmen.map(m => (
            <div key={m.text} className={`rounded-xl border px-4 py-3 ${statusStyle[m.status]}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wide">{statusLabel[m.status]}</div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">{m.text}</div>
              {m.grund && <div className="mt-1 text-xs text-gray-600">Begründung: {m.grund}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SoonTab({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
      <div className="font-medium text-gray-700">Modul „{label}“</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Dieses Beteiligungsmodul ist angelegt und wird in dieser Demo als Nächstes ausgebaut.</p>
    </div>
  )
}
