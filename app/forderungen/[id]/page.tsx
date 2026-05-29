'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, ThumbsUp, MessageSquare, Lightbulb, ShieldCheck, CheckCircle, Circle, AlertCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const VOTE_THRESHOLD = 300

const PROCESS_STEPS = [
  { label: 'Eingereicht' },
  { label: 'Relevanz wird gesammelt' },
  { label: 'Antworten laufen' },
  { label: 'Bürgerpriorisierung möglich' },
  { label: 'In politischer Beratung' },
  { label: 'Ergebnis dokumentiert' },
]

const STATUS_TO_STEP: Record<string, number> = {
  eingereicht: 0,
  geprüft:     1,
  bearbeitet:  4,
  umgesetzt:   5,
}

const POSITION_STYLES: Record<string, { bg: string; label: string }> = {
  'unterstützt':           { bg: 'bg-green-100 text-green-700',  label: 'Unterstützt' },
  'lehnt ab':              { bg: 'bg-red-100 text-red-600',      label: 'Lehnt ab' },
  'prüft':                 { bg: 'bg-yellow-100 text-yellow-700',label: 'In Prüfung' },
  'teilweise unterstützt': { bg: 'bg-blue-100 text-blue-700',    label: 'Teilw. Unterstützung' },
  'alternative':           { bg: 'bg-purple-100 text-purple-700',label: 'Alternative vorgeschlagen' },
}

const CONTRIBUTION_STYLES = {
  unterstützend: { bg: 'bg-green-50 border-green-100', badge: 'bg-green-100 text-green-700', label: 'Unterstützender Beitrag' },
  gegenargument: { bg: 'bg-red-50 border-red-100',     badge: 'bg-red-100 text-red-600',     label: 'Gegenargument' },
  alternative:   { bg: 'bg-blue-50 border-blue-100',   badge: 'bg-blue-100 text-blue-700',   label: 'Alternative Lösung' },
}

// Demo-Daten — werden später durch echte DB-Einträge ersetzt
const DEMO_ADDRESSEES = ['Stadt Köln', 'Stadtplanungsamt', 'Bezirksvertretung Innenstadt', 'Fraktionen im Stadtrat']

const DEMO_SOLUTION = 'Die Stadt soll ein strukturiertes Konzept für sichere Radinfrastruktur im gesamten Stadtteil Neustadt-Süd entwickeln. Das Konzept soll fehlende Markierungen ergänzen, Konfliktpunkte mit dem Autoverkehr entschärfen und regelmäßige Kontrollen von zugeparkten Radwegen sicherstellen.'

const DEMO_RESPONSES = [
  {
    id: '1', author: 'Stadt Köln', role: 'Verwaltung', party: null,
    position: 'prüft',
    content: 'Das Anliegen wird fachlich geprüft. Die Zuständigkeiten zwischen Stadtplanungsamt und Bezirksvertretung werden aktuell geklärt.',
    date: '2026-05-15',
  },
  {
    id: '2', author: 'SPD Köln', role: 'Fraktion', party: 'SPD',
    position: 'unterstützt',
    content: 'Wir unterstützen die Forderung und haben sie in unserer letzten Fraktionssitzung besprochen. Ein Antrag wird vorbereitet.',
    date: '2026-05-18',
  },
  {
    id: '3', author: 'Grüne Köln', role: 'Fraktion', party: 'Grüne',
    position: 'teilweise unterstützt',
    content: 'Wir sehen den Handlungsbedarf, möchten aber auch den Ausbau von Fahrradstellplätzen und die Verbesserung der Beleuchtung an Radwegen stärker in den Fokus stellen.',
    date: '2026-05-20',
  },
]

const DEMO_CONTRIBUTIONS = [
  { id: '1', type: 'unterstützend', author: 'Anwohnerin, 34', content: 'Ich fahre täglich mit dem Rad zur Arbeit. Die Situation an der Kreuzung Bonner Straße ist wirklich gefährlich — dort parken regelmäßig Autos auf dem Radweg.', date: '2026-05-12' },
  { id: '2', type: 'gegenargument', author: 'Anwohner, 55', content: 'Bevor neue Markierungen gezogen werden, sollte die Stadt prüfen, ob der Platz auf den betroffenen Straßen überhaupt ausreicht. Sonst entstehen nur Konflikte.', date: '2026-05-13' },
  { id: '3', type: 'alternative', author: 'Bürgerin, 41', content: 'Statt vieler kleiner Maßnahmen wäre eine komplett autofreie Nebenstraße als Fahrradstraße sinnvoller — das schafft eine sichere Verbindungsroute durch den ganzen Stadtteil.', date: '2026-05-14' },
]

type Demand = {
  id: string
  title: string
  description: string | null
  solution: string | null
  addressees: string[] | null
  category: string | null
  supports: number
  status: string
  created_at: string
}

type ContributionType = 'unterstützend' | 'gegenargument' | 'alternative'

type Argument = {
  id: string
  type: string
  text: string
  created_at: string
}

type Response = {
  id: string
  author: string
  role: string
  party: string | null
  position: string
  text: string
  created_at: string
}

export default function ForderungDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [activeContribType, setActiveContribType] = useState<ContributionType>('unterstützend')
  const [showContribModal, setShowContribModal] = useState(false)
  const [newContribType, setNewContribType] = useState<ContributionType>('unterstützend')
  const [newContribText, setNewContribText] = useState('')
  const [submittingContrib, setSubmittingContrib] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      setUserId(userData.user?.id ?? null)

      const [{ data: demandData }, { data: argsData }, { data: respData }] = await Promise.all([
        supabase.from('demands').select('*').eq('id', id).single(),
        supabase.from('demand_arguments').select('*').eq('demand_id', id).order('created_at', { ascending: true }),
        supabase.from('demand_responses').select('*').eq('demand_id', id).order('created_at', { ascending: true }),
      ])

      setDemand(demandData)
      setArguments(argsData ?? [])
      setResponses(respData ?? [])

      if (userData.user?.id) {
        const { data: support } = await supabase
          .from('demand_supports').select('id').eq('demand_id', id).eq('user_id', userData.user.id).single()
        setIsSupported(!!support)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function submitContrib() {
    if (!userId || newContribText.trim().length < 10) return
    setSubmittingContrib(true)
    const supabase = createClient()
    const { data } = await supabase.from('demand_arguments').insert({
      demand_id: id,
      user_id: userId,
      type: newContribType,
      text: newContribText.trim(),
    }).select('*').single()
    if (data) setArguments(prev => [...prev, data])
    setShowContribModal(false)
    setNewContribText('')
    setSubmittingContrib(false)
  }

  async function toggleSupport() {
    if (!userId) { router.push('/login'); return }
    const supabase = createClient()
    if (isSupported) {
      await supabase.from('demand_supports').delete().eq('demand_id', id).eq('user_id', userId)
      await supabase.rpc('decrement_supports', { demand_id: id })
      setDemand(prev => prev ? { ...prev, supports: prev.supports - 1 } : prev)
    } else {
      await supabase.from('demand_supports').insert({ demand_id: id, user_id: userId })
      await supabase.rpc('increment_supports', { demand_id: id })
      setDemand(prev => prev ? { ...prev, supports: prev.supports + 1 } : prev)
    }
    setIsSupported(!isSupported)
  }

  if (loading) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
        </div>
      </main>
    </>
  )

  if (!demand) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Forderung nicht gefunden</div>
      </main>
    </>
  )

  const currentStep = STATUS_TO_STEP[demand.status] ?? 0
  const isAbgelehnt = demand.status === 'abgelehnt'
  const progress = Math.min((demand.supports / VOTE_THRESHOLD) * 100, 100)
  const remaining = Math.max(VOTE_THRESHOLD - demand.supports, 0)

  const displayArguments = arguments_.length > 0 ? arguments_ : DEMO_CONTRIBUTIONS
  const displayResponses = responses.length > 0 ? responses : DEMO_RESPONSES
  const displaySolution = demand.solution ?? DEMO_SOLUTION
  const displayAddressees = demand.addressees ?? DEMO_ADDRESSEES

  const contribCounts = {
    unterstützend: displayArguments.filter(c => c.type === 'unterstützend').length,
    gegenargument: displayArguments.filter(c => c.type === 'gegenargument').length,
    alternative:   displayArguments.filter(c => c.type === 'alternative').length,
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-8">

          <Link href="/forderungen" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
            <ChevronLeft size={15} /> Alle Forderungen
          </Link>

          {/* 1. Titel & Einordnung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {demand.category && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{demand.category}</span>
              )}
              <span className="text-xs text-gray-400">Köln · Neustadt-Süd</span>
              {!isAbgelehnt && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  {PROCESS_STEPS[currentStep]?.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{demand.title}</h1>
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
              Diese Forderung beschreibt ein strukturelles lokales Anliegen. Einzelne Schäden wie kaputte Laternen oder Müll gehören in offizielle Mängelmelder der Stadt.
            </div>
          </div>

          {/* 2. Problem + Lösung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Das Problem</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {demand.description ?? 'Keine Beschreibung hinterlegt.'}
                </p>
              </div>
              <div className="md:border-l md:pl-5 border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Gewünschte Lösung</div>
                <p className="text-sm text-gray-700 leading-relaxed">{displaySolution}</p>
              </div>
            </div>
          </div>

          {/* 3. Adressaten */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Adressiert an</div>
            <div className="flex flex-wrap gap-2">
              {displayAddressees.map(a => (
                <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{a}</span>
              ))}
            </div>
          </div>

          {/* 4. Unterstützung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">{demand.supports}</div>
                <div className="text-sm text-gray-500 mt-0.5">von {VOTE_THRESHOLD} Unterstützungen</div>
              </div>
              <button
                onClick={toggleSupport}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isSupported ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ThumbsUp size={16} className={isSupported ? 'fill-white' : ''} />
                {isSupported ? 'Unterstützt' : 'Forderung unterstützen'}
              </button>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400">
              Unterstützung bedeutet: Ich finde dieses Anliegen relevant. Das ist noch keine Abstimmung.
              {remaining > 0 && ` · Noch ${remaining} Unterstützungen bis zur Bürgerpriorisierung.`}
            </p>
          </div>

          {/* 5. Drei Bürgeraktionen */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Dein Beitrag zur Diskussion</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'unterstützend' as ContributionType, icon: ThumbsUp,      label: 'Unterstützender Beitrag', desc: 'Ich finde diese Forderung wichtig und teile die Einschätzung.' },
                { type: 'gegenargument' as ContributionType, icon: MessageSquare, label: 'Gegenargument',            desc: 'Ich sehe das Problem anders oder halte die Lösung für problematisch.' },
                { type: 'alternative'   as ContributionType, icon: Lightbulb,     label: 'Alternative vorschlagen', desc: 'Ich erkenne das Problem, schlage aber einen anderen Lösungsweg vor.' },
              ].map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => { if (!userId) { router.push('/login'); return } setNewContribType(type); setShowContribModal(true) }}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
                >
                  <Icon size={18} className="text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Bürgerbeiträge */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Beiträge aus der Bürgerschaft</div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-5">
              {(['unterstützend', 'gegenargument', 'alternative'] as ContributionType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveContribType(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeContribType === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'unterstützend' && `Unterstützend (${contribCounts.unterstützend})`}
                  {tab === 'gegenargument' && `Gegenargument (${contribCounts.gegenargument})`}
                  {tab === 'alternative'   && `Alternative (${contribCounts.alternative})`}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {displayArguments.filter(c => c.type === activeContribType).length === 0 ? (
                <div className="text-sm text-gray-400 py-4 text-center">Noch keine Beiträge in dieser Kategorie.</div>
              ) : displayArguments.filter(c => c.type === activeContribType).map(c => {
                const style = CONTRIBUTION_STYLES[c.type as ContributionType]
                const entry = c as Record<string, string>
                const dateStr = entry.date ?? entry.created_at
                const bodyText = entry.content ?? entry.text
                return (
                  <div key={c.id} className={`rounded-xl border p-4 ${style.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
                      <span className="text-xs text-gray-400">{new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-1">{bodyText}</p>
                    {entry.author && <div className="text-xs text-gray-400">{entry.author}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 7. Antworten von Verwaltung & Politik */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Antworten von Verwaltung & Politik</div>
              <ShieldCheck size={13} className="text-blue-400" />
            </div>
            <div className="flex flex-col gap-4">
              {displayResponses.length === 0 ? (
                <div className="text-sm text-gray-400 py-4 text-center">Noch keine Rückmeldungen aus Politik oder Verwaltung.</div>
              ) : displayResponses.map(r => {
                const pos = POSITION_STYLES[r.position]
                const resp = r as Record<string, string>
                const dateStr = resp.date ?? resp.created_at
                const bodyText = resp.content ?? resp.text
                return (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {r.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{r.author}</div>
                          <div className="text-xs text-gray-400">{r.role}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          <ShieldCheck size={11} /> Verifizierte Rückmeldung
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pos?.bg ?? 'bg-gray-100 text-gray-600'}`}>
                          {pos?.label ?? r.position}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{bodyText}</p>
                    <div className="text-xs text-gray-400">
                      {new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 8. Prozessstatus kompakt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Aktueller Prozessstand</div>
            {isAbgelehnt ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} /> Diese Forderung wurde nicht weiterverfolgt
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {PROCESS_STEPS.map((step, i) => {
                  const done = i < currentStep
                  const active = i === currentStep
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {done
                        ? <CheckCircle size={16} className="text-blue-600 shrink-0" />
                        : active
                        ? <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
                        : <Circle size={16} className="text-gray-200 shrink-0" />
                      }
                      <span className={`text-sm ${active ? 'text-blue-600 font-semibold' : done ? 'text-gray-700' : 'text-gray-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 9. Bürgerpriorisierung Vorschau */}
          {!isAbgelehnt && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Mögliche spätere Bürgerpriorisierung</div>
              <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                Diese Forderung ist noch keine Abstimmung. Wenn genug Unterstützung gesammelt wurde, können konkrete Lösungsoptionen von Bürgern priorisiert werden.
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {['Mehr Kontrollen & Ordnungsamt', 'Separate Fahrradstraße', 'Markierungen & Beschilderung', 'Kombiniertes Maßnahmenpaket'].map(opt => (
                  <div key={opt} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-blue-100 text-sm text-gray-600">
                    <Circle size={14} className="text-blue-300 shrink-0" />
                    {opt}
                  </div>
                ))}
              </div>
              {remaining > 0 && (
                <div className="text-sm font-semibold text-blue-600">
                  Noch {remaining} Unterstützungen bis zur Bürgerpriorisierung
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Beitrag Modal */}
      {showContribModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowContribModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <button onClick={() => setShowContribModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Beitrag hinzufügen</h2>
            <p className="text-sm text-gray-500 mb-5">Wähle den Typ deines Beitrags und formuliere ihn sachlich.</p>

            <div className="flex gap-2 mb-5">
              {(['unterstützend', 'gegenargument', 'alternative'] as ContributionType[]).map(t => (
                <button key={t} onClick={() => setNewContribType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${newContribType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {t === 'unterstützend' ? 'Unterstützend' : t === 'gegenargument' ? 'Gegenargument' : 'Alternative'}
                </button>
              ))}
            </div>

            <textarea
              value={newContribText}
              onChange={e => setNewContribText(e.target.value)}
              placeholder={
                newContribType === 'unterstützend' ? 'Warum findest du diese Forderung wichtig?' :
                newContribType === 'gegenargument' ? 'Was siehst du kritisch an dieser Forderung oder Lösung?' :
                'Welchen alternativen Lösungsweg schlägst du vor?'
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            <button
              disabled={newContribText.trim().length < 10 || submittingContrib}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
              onClick={submitContrib}
            >
              {submittingContrib ? 'Einreichen…' : 'Beitrag einreichen'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
