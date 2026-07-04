'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, ThumbsUp, MessageSquare, Lightbulb, ShieldCheck, CheckCircle, Circle, AlertCircle, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RepScoreBadge from '@/components/RepScoreBadge'
import { computeRepScoreForUsers } from '@/lib/repScore'

const RELEVANCE_THRESHOLD = 50

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

type PositionType = 'unterstützend' | 'gegenargument' | 'alternative'

const POSITION_META: Record<PositionType, { icon: typeof ThumbsUp; label: string; desc: string; badge: string; box: string }> = {
  unterstützend: { icon: ThumbsUp,      label: 'Unterstützung',    desc: 'Ich finde diese Forderung wichtig. Begründung optional.', badge: 'bg-green-100 text-green-700', box: 'bg-green-50 border-green-100' },
  gegenargument: { icon: MessageSquare, label: 'Gegenargument',    desc: 'Ich sehe das anders. Begründung optional.',              badge: 'bg-red-100 text-red-600',     box: 'bg-red-50 border-red-100' },
  alternative:   { icon: Lightbulb,     label: 'Alternative',      desc: 'Ich schlage einen anderen Weg vor. Text erforderlich.',  badge: 'bg-blue-100 text-blue-700',   box: 'bg-blue-50 border-blue-100' },
}

// Demo-Daten — Antworten von Politik/Verwaltung kommen in einer späteren Phase aus echten Einträgen
const DEMO_ADDRESSEES = ['Stadt Köln', 'Stadtplanungsamt', 'Bezirksvertretung Innenstadt', 'Fraktionen im Stadtrat']
const DEMO_SOLUTION = 'Die Stadt soll ein strukturiertes Konzept für sichere Radinfrastruktur in Köln Innenstadt entwickeln. Das Konzept soll fehlende Markierungen ergänzen, Konfliktpunkte mit dem Autoverkehr entschärfen und regelmäßige Kontrollen von zugeparkten Radwegen sicherstellen.'
const DEMO_RESPONSES = [
  { id: '1', author: 'Stadt Köln', role: 'Verwaltung', position: 'prüft', text: 'Das Anliegen wird fachlich geprüft. Die Zuständigkeiten zwischen Stadtplanungsamt und Bezirksvertretung werden aktuell geklärt.', created_at: '2026-05-15' },
  { id: '2', author: 'SPD Köln', role: 'Fraktion', position: 'unterstützt', text: 'Wir unterstützen die Forderung und haben sie in unserer letzten Fraktionssitzung besprochen. Ein Antrag wird vorbereitet.', created_at: '2026-05-18' },
]

type Demand = {
  id: string
  title: string
  description: string | null
  solution: string | null
  addressees: string[] | null
  category: string | null
  relevance_score: number
  status: string
  created_at: string
}

type Argument = {
  id: string
  user_id: string
  type: string
  text: string | null
  created_at: string
}

type Response = { id: string; author: string; role: string; position: string; text: string; created_at: string }

export default function ForderungDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [arguments_, setArguments] = useState<Argument[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeContribType, setActiveContribType] = useState<PositionType>('unterstützend')
  const [rep, setRep] = useState<{ score: number; participants: number }>({ score: 0, participants: 0 })

  // Positions-Editor
  const [selectedType, setSelectedType] = useState<PositionType | null>(null)
  const [draftText, setDraftText] = useState('')
  const [savingPos, setSavingPos] = useState(false)
  const [posError, setPosError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const [{ data: demandData }, { data: argsData }, { data: respData }] = await Promise.all([
        supabase.from('demands').select('*').eq('id', id).single(),
        supabase.from('demand_arguments').select('id, user_id, type, text, created_at').eq('demand_id', id).order('created_at', { ascending: true }),
        supabase.from('demand_responses').select('*').eq('demand_id', id).order('created_at', { ascending: true }),
      ])

      setDemand(demandData)
      const args = argsData ?? []
      setArguments(args)
      setResponses(respData ?? [])

      // eigene Position in den Editor laden
      const own = args.find(a => a.user_id === uid)
      if (own) {
        setSelectedType(own.type as PositionType)
        setDraftText(own.text ?? '')
      }

      // Likes für die Beiträge dieser Forderung laden
      const argIds = args.map(a => a.id)
      if (argIds.length > 0) {
        const { data: likes } = await supabase.from('demand_argument_likes').select('argument_id, user_id').in('argument_id', argIds)
        const counts: Record<string, number> = {}
        const mine = new Set<string>()
        for (const l of likes ?? []) {
          counts[l.argument_id] = (counts[l.argument_id] ?? 0) + 1
          if (l.user_id === uid) mine.add(l.argument_id)
        }
        setLikeCounts(counts)
        setUserLikes(mine)
      }
      setLoading(false)
    }
    load()
  }, [id])

  // Repräsentativitäts-Score der Beteiligten-Kohorte, neu berechnet wenn sich Positionen ändern
  useEffect(() => {
    const supabase = createClient()
    computeRepScoreForUsers(supabase, arguments_.map(a => a.user_id)).then(setRep)
  }, [arguments_])

  const ownPosition = arguments_.find(a => a.user_id === userId) ?? null

  async function savePosition() {
    if (!userId) { router.push('/login'); return }
    if (!selectedType) return
    const text = draftText.trim()
    if (selectedType === 'alternative' && text.length < 10) {
      setPosError('Für eine Alternative ist ein Textbeitrag erforderlich (mind. 10 Zeichen).')
      return
    }
    setSavingPos(true)
    setPosError('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('demand_arguments')
      .upsert({ demand_id: id, user_id: userId, type: selectedType, text: text || null }, { onConflict: 'demand_id,user_id' })
      .select('id, user_id, type, text, created_at')
      .single()
    setSavingPos(false)
    if (error) { setPosError(error.message); return }
    setArguments(prev => [...prev.filter(a => a.user_id !== userId), data])
  }

  async function removePosition() {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('demand_arguments').delete().eq('demand_id', id).eq('user_id', userId)
    setArguments(prev => prev.filter(a => a.user_id !== userId))
    setSelectedType(null)
    setDraftText('')
  }

  async function toggleLike(argId: string) {
    if (!userId) { router.push('/login'); return }
    const supabase = createClient()
    const liked = userLikes.has(argId)
    setUserLikes(prev => { const n = new Set(prev); liked ? n.delete(argId) : n.add(argId); return n })
    setLikeCounts(prev => ({ ...prev, [argId]: (prev[argId] ?? 0) + (liked ? -1 : 1) }))
    if (liked) {
      await supabase.from('demand_argument_likes').delete().eq('argument_id', argId).eq('user_id', userId)
    } else {
      await supabase.from('demand_argument_likes').insert({ argument_id: argId, user_id: userId })
    }
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

  // Relevanz = Anzahl der Positionen (ein Like + Text zählt als ein Engagement)
  const relevance = arguments_.length
  const progress = Math.min((relevance / RELEVANCE_THRESHOLD) * 100, 100)
  const remaining = Math.max(RELEVANCE_THRESHOLD - relevance, 0)

  const displayResponses = responses.length > 0 ? responses : DEMO_RESPONSES
  const displaySolution = demand.solution ?? DEMO_SOLUTION
  const displayAddressees = demand.addressees ?? DEMO_ADDRESSEES

  // Nur Beiträge MIT Text werden als Bürgerbeiträge angezeigt, sortiert nach Likes
  const textArgs = arguments_.filter(a => a.text && a.text.trim().length > 0)
  const contribCounts = {
    unterstützend: textArgs.filter(c => c.type === 'unterstützend').length,
    gegenargument: textArgs.filter(c => c.type === 'gegenargument').length,
    alternative:   textArgs.filter(c => c.type === 'alternative').length,
  }
  const visibleContribs = textArgs
    .filter(c => c.type === activeContribType)
    .sort((a, b) => (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0))

  const canSave = selectedType !== null &&
    (selectedType !== 'alternative' || draftText.trim().length >= 10) &&
    !(ownPosition?.type === selectedType && (ownPosition?.text ?? '') === draftText.trim())

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
              <span className="text-xs text-gray-400">Köln Innenstadt</span>
              {!isAbgelehnt && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  {PROCESS_STEPS[currentStep]?.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{demand.title}</h1>
            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
              Diese Forderung beschreibt ein lokales Anliegen für Köln Innenstadt.
            </div>
          </div>

          {/* 2. Problem + Lösung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Das Problem</div>
                <p className="text-sm text-gray-700 leading-relaxed">{demand.description ?? 'Keine Beschreibung hinterlegt.'}</p>
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

          {/* 4. Relevanz-Score (nur Anzeige) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">{relevance}</div>
                <div className="text-sm text-gray-500 mt-0.5">von {RELEVANCE_THRESHOLD} Relevanzpunkten</div>
              </div>
              <div className="text-right">
                <RepScoreBadge score={rep.score} participants={rep.participants} />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Der Relevanz-Score zählt das gesamte Engagement rund um diese Forderung — Unterstützung, Gegenargumente und Alternativen zusammen.
              {remaining > 0 && ` Noch ${remaining} Relevanzpunkte bis zur möglichen Bürgerpriorisierung.`}
            </p>
          </div>

          {/* 5. Deine Position */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Deine Position zu dieser Forderung</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {(Object.keys(POSITION_META) as PositionType[]).map(type => {
                const meta = POSITION_META[type]
                const Icon = meta.icon
                const isSelected = selectedType === type
                const isCurrent = ownPosition?.type === type
                return (
                  <button
                    key={type}
                    onClick={() => { if (!userId) { router.push('/login'); return } setSelectedType(type); setPosError(''); if (ownPosition?.type === type) setDraftText(ownPosition.text ?? '') ; else setDraftText('') }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                      {isCurrent && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">Aktiv</span>}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">{meta.label}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{meta.desc}</div>
                  </button>
                )
              })}
            </div>

            {selectedType && (
              <div>
                <textarea
                  value={draftText}
                  onChange={e => { setDraftText(e.target.value); setPosError('') }}
                  rows={3}
                  placeholder={
                    selectedType === 'unterstützend' ? 'Warum findest du diese Forderung wichtig? (optional)' :
                    selectedType === 'gegenargument' ? 'Was siehst du kritisch? (optional)' :
                    'Beschreibe deinen alternativen Lösungsweg (erforderlich)'
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                />
                {selectedType === 'alternative' && (
                  <p className="text-xs text-gray-400 mb-2">Eine Alternative braucht immer eine konkrete Beschreibung.</p>
                )}
                {posError && <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl mb-2">{posError}</div>}
                <div className="flex items-center gap-3">
                  <button
                    onClick={savePosition}
                    disabled={!canSave || savingPos}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingPos ? 'Speichern…' : ownPosition ? 'Position aktualisieren' : 'Position speichern'}
                  </button>
                  {ownPosition && (
                    <button onClick={removePosition} className="text-sm text-gray-400 hover:text-red-600 transition-colors">
                      Position entfernen
                    </button>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Du kannst pro Forderung eine Position wählen. Wenn du deine Meinung änderst, ersetzt eine neue Position die vorherige — es zählt immer nur eine Stimme pro Person.
            </p>
          </div>

          {/* 6. Bürgerbeiträge mit Like-System */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Beiträge aus der Bürgerschaft</div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-5">
              {(['unterstützend', 'gegenargument', 'alternative'] as PositionType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveContribType(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeContribType === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {POSITION_META[tab].label} ({contribCounts[tab]})
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {visibleContribs.length === 0 ? (
                <div className="text-sm text-gray-400 py-4 text-center">Noch keine Beiträge in dieser Kategorie.</div>
              ) : visibleContribs.map(c => {
                const meta = POSITION_META[c.type as PositionType]
                const isOwn = c.user_id === userId
                const likes = likeCounts[c.id] ?? 0
                const liked = userLikes.has(c.id)
                return (
                  <div key={c.id} className={`rounded-xl border p-4 ${meta.box}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>{meta.label}</span>
                      <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.text}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => !isOwn && toggleLike(c.id)}
                        disabled={isOwn}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isOwn ? 'text-gray-300 cursor-default' : liked ? 'bg-blue-600 text-white' : 'bg-white/70 text-gray-500 hover:text-blue-600 border border-gray-200'
                        }`}
                      >
                        <Heart size={12} className={liked && !isOwn ? 'fill-white' : ''} />
                        {likes}
                      </button>
                      {isOwn && <span className="text-xs text-gray-400">Dein Beitrag</span>}
                    </div>
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
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{r.text}</p>
                    <div className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 8. Prozessstatus */}
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
                Diese Forderung ist noch keine Abstimmung. Sobald genug Relevanz gesammelt wurde, können konkrete Lösungsoptionen von Bürgern priorisiert werden.
              </p>
              {remaining > 0 && (
                <div className="text-sm font-semibold text-blue-600">
                  Noch {remaining} Relevanzpunkte bis zur Bürgerpriorisierung
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
