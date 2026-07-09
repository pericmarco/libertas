'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Lightbulb, ShieldCheck, CheckCircle, Circle, AlertCircle, Heart, Undo2, ChevronDown, Wrench, Info, X, MapPin, Lock, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Karte nur clientseitig und erst bei Bedarf laden.
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse" />,
})
import RepScoreBadge from '@/components/RepScoreBadge'
import { computeRepScoreForUsers } from '@/lib/repScore'
import { ART_LABELS, SCOPE_LABELS, FEEDBACK_LABELS, themenForTags } from '@/lib/einreichung'

const RELEVANCE_THRESHOLD = 50

// Muss mit der Forderungsübersicht übereinstimmen: so viele Forderungen
// sind für nicht angemeldete Besucher voll sichtbar.
const PUBLIC_PREVIEW_COUNT = 2

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

// Mängelmeldungen durchlaufen einen einfacheren, transaktionalen Prozess
const MANGEL_STEPS = [
  { label: 'Eingereicht' },
  { label: 'Vom Lybertas-Team geprüft' },
  { label: 'An zuständige Stelle weitergeleitet' },
  { label: 'Erledigt' },
]

const MANGEL_STATUS_TO_STEP: Record<string, number> = {
  eingereicht: 0,
  geprüft:     1,
  bearbeitet:  2,
  umgesetzt:   3,
}

const POSITION_STYLES: Record<string, { bg: string; label: string }> = {
  'unterstützt':           { bg: 'bg-green-100 text-green-700',  label: 'Unterstützt' },
  'lehnt ab':              { bg: 'bg-red-100 text-red-600',      label: 'Lehnt ab' },
  'prüft':                 { bg: 'bg-yellow-100 text-yellow-700',label: 'In Prüfung' },
  'teilweise unterstützt': { bg: 'bg-blue-100 text-blue-700',    label: 'Teilw. Unterstützung' },
  'alternative':           { bg: 'bg-purple-100 text-purple-700',label: 'Alternative vorgeschlagen' },
}

type PositionType = 'unterstützend' | 'gegenargument' | 'alternative'

const ROLE_BADGES: Record<string, { label: string; badge: string }> = {
  admin:      { label: 'Lybertas-Team', badge: 'bg-blue-600 text-white' },
  city:       { label: 'Stadt',         badge: 'bg-emerald-100 text-emerald-700' },
  politician: { label: 'Politik',       badge: 'bg-purple-100 text-purple-700' },
}

const POSITION_META: Record<PositionType, { icon: typeof ThumbsUp; label: string; desc: string; badge: string; box: string }> = {
  unterstützend: { icon: ThumbsUp,      label: 'Unterstützung',    desc: 'Ich finde diese Forderung wichtig. Begründung optional.', badge: 'bg-green-100 text-green-700', box: 'bg-green-50 border-green-100' },
  gegenargument: { icon: MessageSquare, label: 'Gegenargument',    desc: 'Ich sehe das anders. Begründung optional.',              badge: 'bg-red-100 text-red-600',     box: 'bg-red-50 border-red-100' },
  alternative:   { icon: Lightbulb,     label: 'Alternative',      desc: 'Ich schlage einen anderen Weg vor. Text erforderlich.',  badge: 'bg-blue-100 text-blue-700',   box: 'bg-blue-50 border-blue-100' },
}

type Demand = {
  id: string
  title: string
  description: string | null
  solution: string | null
  addressees: string[] | null
  category: string | null
  tags: string[] | null
  submission_type: string | null
  location: string | null
  location_scope: string | null
  lat: number | null
  lng: number | null
  locations: { lat: number; lng: number }[] | null
  frequency: string | null
  affected_groups: string[] | null
  impacts: string[] | null
  solution_direction: string | null
  feedback_wanted: string | null
  relevance_score: number
  status: string
  user_id: string | null
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
  const [usernames, setUsernames] = useState<Record<string, string>>({})
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeContribType, setActiveContribType] = useState<PositionType>('unterstützend')
  const [rep, setRep] = useState<{ score: number; participants: number }>({ score: 0, participants: 0 })
  const [showDetails, setShowDetails] = useState(false)
  const [showResponses, setShowResponses] = useState(false)
  const [discussionOpen, setDiscussionOpen] = useState(false)

  // Hintergrund nicht scrollen, solange die Vollbild-Diskussion offen ist
  useEffect(() => {
    document.body.style.overflow = discussionOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [discussionOpen])

  // Positions-Editor
  const [selectedType, setSelectedType] = useState<PositionType | null>(null)
  const [draftText, setDraftText] = useState('')
  const [savingPos, setSavingPos] = useState(false)
  // Nach abgegebener Position ist die Karte eingeklappt; „Position ändern"
  // öffnet den Editor wieder.
  const [editingPosition, setEditingPosition] = useState(false)
  const [posError, setPosError] = useState('')
  // Nicht angemeldete Besucher sehen nur die zwei relevantesten Forderungen;
  // alle anderen Detailseiten sind gesperrt.
  const [anonGated, setAnonGated] = useState(false)

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

      // Öffentliche Vorschau: für nicht angemeldete Besucher ist nur die
      // Detailseite der zwei relevantesten Forderungen freigeschaltet.
      if (!uid && demandData) {
        const { data: topIds } = await supabase.from('demands')
          .select('id')
          .neq('status', 'zurückgezogen')
          .or('submission_type.is.null,submission_type.neq.mangel')
          .order('relevance_score', { ascending: false })
          .limit(PUBLIC_PREVIEW_COUNT)
        setAnonGated(!(topIds ?? []).some(t => t.id === demandData.id))
      }

      const args = argsData ?? []
      setArguments(args)
      setResponses(respData ?? [])

      // eigene Position in den Editor laden
      const own = args.find(a => a.user_id === uid)
      if (own) {
        setSelectedType(own.type as PositionType)
        setDraftText(own.text ?? '')
      }

      // Nutzernamen + Rollen der Beteiligten laden (Beiträge + Forderungs-Autor)
      const authorIds = [...new Set([...args.map(a => a.user_id), demandData?.user_id].filter(Boolean))] as string[]
      if (authorIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, username, role').in('id', authorIds)
        setUsernames(Object.fromEntries((profs ?? []).filter(p => p.username).map(p => [p.id, p.username as string])))
        setRoles(Object.fromEntries((profs ?? []).map(p => [p.id, p.role as string])))
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
    setEditingPosition(false)
  }

  async function removePosition() {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('demand_arguments').delete().eq('demand_id', id).eq('user_id', userId)
    setArguments(prev => prev.filter(a => a.user_id !== userId))
    setSelectedType(null)
    setDraftText('')
    setEditingPosition(false)
  }

  async function withdrawDemand() {
    if (!userId || !demand || demand.user_id !== userId) return
    if (!window.confirm('Forderung wirklich zurückziehen? Sie ist danach für andere Bürger nicht mehr sichtbar.')) return
    const supabase = createClient()
    const { error } = await supabase.rpc('withdraw_demand', { d_id: id })
    if (!error) {
      setDemand(prev => prev ? { ...prev, status: 'zurückgezogen' } : prev)
    }
  }

  // Verortung stabil ableiten — sonst bekäme die Karte bei jedem Render
  // (z. B. beim Tippen in der Diskussion) neue Pin-Objekte und würde die
  // Marker unnötig neu aufbauen.
  const ortPins = useMemo(() => {
    if (!demand) return []
    return (Array.isArray(demand.locations) && demand.locations.length > 0
      ? demand.locations
      : demand.lat != null && demand.lng != null ? [{ lat: demand.lat, lng: demand.lng }] : []
    )
      .filter(p => p && p.lat != null && p.lng != null)
      .map(p => ({ lng: p.lng, lat: p.lat }))
  }, [demand])

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

  // Gesperrte Detailseite für nicht angemeldete Besucher (außerhalb der Top-2)
  if (anonGated) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <Link href="/forderungen" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft size={16} /> Zurück zur Übersicht
          </Link>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{demand.title}</h1>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Diese Forderung kannst du nach einer kostenlosen Anmeldung vollständig lesen,
              unterstützen und mitdiskutieren. Zwei aktuelle Forderungen sind auch ohne
              Anmeldung offen einsehbar.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <LogIn size={16} /> Anmelden oder registrieren
            </Link>
          </div>
        </div>
      </main>
    </>
  )

  const currentStep = STATUS_TO_STEP[demand.status] ?? 0
  const isAbgelehnt = demand.status === 'abgelehnt'
  const isZurueckgezogen = demand.status === 'zurückgezogen'
  const isOwner = !!userId && demand.user_id === userId
  // Mängelmeldungen gehen ans Lybertas-Team — keine öffentliche Abstimmungs-Mechanik
  const isMangel = demand.submission_type === 'mangel'
  const themen = demand.tags && demand.tags.length > 0 ? themenForTags(demand.tags) : []

  // Relevanz = Anzahl der Positionen (ein Like + Text zählt als ein Engagement)
  const relevance = arguments_.length
  const progress = Math.min((relevance / RELEVANCE_THRESHOLD) * 100, 100)
  const remaining = Math.max(RELEVANCE_THRESHOLD - relevance, 0)

  const displayResponses = responses

  // Zweistufige Ansicht: Strukturdaten aus dem Einreichungs-Wizard
  const detailRows: [string, string][] = ([
    ['Art des Anliegens', demand.submission_type ? ART_LABELS[demand.submission_type] : ''],
    ['Ort', demand.location ?? ''],
    ['Ortsebene', demand.location_scope ? SCOPE_LABELS[demand.location_scope] : ''],
    ['Häufigkeit', demand.frequency ?? ''],
    ['Besonders betroffen', demand.affected_groups?.join(', ') ?? ''],
    ['Auswirkungen', demand.impacts?.join(', ') ?? ''],
    ['Lösungsrichtung', demand.solution_direction ?? ''],
    ['Rückmeldung gewünscht von', demand.feedback_wanted ? FEEDBACK_LABELS[demand.feedback_wanted] : ''],
    ['Eingereicht am', new Date(demand.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })],
  ] as [string, string][]).filter(([, v]) => v)

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
        <div className="max-w-3xl mx-auto px-6 py-10">

          <Link href="/forderungen" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft size={15} /> Alle Forderungen
          </Link>

          {/* 1. Titel & Einordnung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {themen.length > 0
                ? themen.map(t => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>
                  ))
                : demand.category && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{demand.category}</span>
                  )}
              <span className="text-xs text-gray-400">{demand.location || 'Köln Innenstadt'}</span>
              {demand.user_id && usernames[demand.user_id] && (
                <span className="text-xs text-gray-400">von @{usernames[demand.user_id]}</span>
              )}
              {!isAbgelehnt && !isMangel && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  {PROCESS_STEPS[currentStep]?.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{demand.title}</h1>
            {demand.tags && demand.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {demand.tags.map(t => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{t}</span>
                ))}
              </div>
            )}
            {isMangel ? (
              <div className="flex items-start gap-2.5 text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 leading-relaxed">
                <Wrench size={15} className="shrink-0 mt-0.5" />
                Mängelmeldung — geht an das Lybertas-Team und wird an die zuständige Stelle der Stadt weitergeleitet.
                Sie steht nicht zur öffentlichen Abstimmung.
              </div>
            ) : (
              <div className="mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs text-gray-500">
                    <span className="font-bold text-gray-900">{relevance}</span> / {RELEVANCE_THRESHOLD} Relevanzpunkte
                    {remaining > 0 && <span className="text-gray-400"> · noch {remaining} bis zur Bürgerpriorisierung</span>}
                  </span>
                  <RepScoreBadge score={rep.score} participants={rep.participants} />
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {isZurueckgezogen && (
              <div className="flex items-center gap-2 mt-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="shrink-0" />
                Diese Forderung wurde vom Autor zurückgezogen und ist nicht mehr öffentlich gelistet.
              </div>
            )}
            {isOwner && !isZurueckgezogen && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400">Das ist deine Forderung.</span>
                <button
                  onClick={withdrawDemand}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Undo2 size={14} />
                  Forderung zurückziehen
                </button>
              </div>
            )}
          </div>

          {/* Ort auf der Karte — nur wenn Koordinaten hinterlegt sind */}
          {ortPins.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              <div className="px-6 pt-5 pb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <MapPin size={13} /> Ort
              </div>
              <MapView
                pins={ortPins}
                center={{ lng: ortPins[0].lng, lat: ortPins[0].lat }}
                zoom={15}
                fit={ortPins.length > 1}
                cooperative
                className="h-64 w-full"
              />
              {demand.location && <p className="px-6 py-3 text-sm text-gray-600">{demand.location}</p>}
            </div>
          )}

          {/* 2. Problem + Lösung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Das Problem</div>
                <p className="text-sm text-gray-700 leading-relaxed">{demand.description ?? 'Keine Beschreibung hinterlegt.'}</p>
              </div>
              <div className="md:border-l md:pl-5 border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Gewünschte Veränderung</div>
                <p className="text-sm text-gray-700 leading-relaxed">{demand.solution ?? 'Keine Angabe.'}</p>
              </div>
            </div>
          </div>

          {/* Deine Position (nicht bei zurückgezogenen Forderungen oder Mängelmeldungen) */}
          {!isZurueckgezogen && !isMangel && ownPosition && !editingPosition ? (
          /* Eingeklappt: Position ist abgegeben — kompakte Zeile statt offenem Editor */
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Deine Position zu dieser Forderung</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-semibold text-blue-700">
                <CheckCircle size={14} />
                {POSITION_META[ownPosition.type as PositionType]?.label ?? ownPosition.type}
              </span>
              <button
                onClick={() => {
                  setSelectedType(ownPosition.type as PositionType)
                  setDraftText(ownPosition.text ?? '')
                  setPosError('')
                  setEditingPosition(true)
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Position ändern
              </button>
            </div>
            <button
              onClick={() => setDiscussionOpen(true)}
              className="mt-4 w-full flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 px-4 py-3 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <MessageSquare size={15} />
                Diskussion ansehen
              </span>
              <span className="flex items-center gap-1.5 text-xs text-blue-500">
                {textArgs.length} {textArgs.length === 1 ? 'Beitrag' : 'Beiträge'}
                <ChevronRight size={14} />
              </span>
            </button>
          </div>
          ) : !isZurueckgezogen && !isMangel && (
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
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
                  {ownPosition && editingPosition && (
                    <button onClick={() => setEditingPosition(false)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      Abbrechen
                    </button>
                  )}
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

            {/* Diskussion direkt an der Position verankert — hier schreibt man, dort liest man */}
            <button
              onClick={() => setDiscussionOpen(true)}
              className="mt-4 w-full flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 px-4 py-3 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquare size={15} className="text-blue-500" />
                Diskussion ansehen
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                {textArgs.length} {textArgs.length === 1 ? 'Beitrag' : 'Beiträge'}
                <ChevronRight size={14} className="text-gray-300" />
              </span>
            </button>
          </div>
          )}

          {/* Bei zurückgezogenen Forderungen (Positions-Karte ausgeblendet) bleibt die Diskussion lesbar */}
          {!isMangel && isZurueckgezogen && (
            <button
              onClick={() => setDiscussionOpen(true)}
              className="w-full bg-white rounded-2xl border border-gray-100 hover:border-blue-200 px-6 py-4 mb-4 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <MessageSquare size={16} className="text-blue-500" />
                Diskussion
                <span className="text-xs font-medium text-gray-400">{textArgs.length} {textArgs.length === 1 ? 'Beitrag' : 'Beiträge'}</span>
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          )}

          {/* Vollbild-Diskussion zum Durchscrollen */}
          {!isMangel && discussionOpen && (
          <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-900 truncate">Diskussion · {demand.title}</div>
                <button onClick={() => setDiscussionOpen(false)} className="text-gray-400 hover:text-gray-700 shrink-0" aria-label="Diskussion schließen">
                  <X size={20} />
                </button>
              </div>
              <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-3">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
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
              </div>
            </div>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-44 flex flex-col gap-3">
              {visibleContribs.length === 0 ? (
                <div className="text-sm text-gray-400 py-10 text-center">Noch keine Beiträge in dieser Kategorie.</div>
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
                      {usernames[c.user_id] && <span className="text-xs text-gray-400">@{usernames[c.user_id]}</span>}
                      {ROLE_BADGES[roles[c.user_id]] && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGES[roles[c.user_id]].badge}`}>
                          {ROLE_BADGES[roles[c.user_id]].label}
                        </span>
                      )}
                      {isOwn && <span className="text-xs text-blue-400 font-medium">Dein Beitrag</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feste Schreibleiste: direkt aus der Diskussion heraus Position beziehen */}
            {!isZurueckgezogen && (
              <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
                  {!userId ? (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Anmelden zum Mitdiskutieren
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(Object.keys(POSITION_META) as PositionType[]).map(type => (
                          <button
                            key={type}
                            onClick={() => { setSelectedType(type); setPosError(''); if (ownPosition?.type === type) setDraftText(ownPosition.text ?? ''); else setDraftText('') }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {POSITION_META[type].label}{ownPosition?.type === type ? ' ✓' : ''}
                          </button>
                        ))}
                      </div>
                      {selectedType ? (
                        <div className="flex gap-2">
                          <textarea
                            value={draftText}
                            onChange={e => { setDraftText(e.target.value); setPosError('') }}
                            rows={1}
                            placeholder={
                              selectedType === 'unterstützend' ? 'Warum findest du diese Forderung wichtig? (optional)' :
                              selectedType === 'gegenargument' ? 'Was siehst du kritisch? (optional)' :
                              'Beschreibe deinen alternativen Lösungsweg (erforderlich)'
                            }
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                          <button
                            onClick={savePosition}
                            disabled={!canSave || savingPos}
                            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0"
                          >
                            {savingPos ? '…' : ownPosition ? 'Aktualisieren' : 'Senden'}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Wähle eine Position, um deinen Beitrag zu schreiben — dein Beitrag zählt als Engagement zur Forderung.</p>
                      )}
                      {posError && <div className="text-xs text-red-600 mt-1.5">{posError}</div>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Antworten von Stadt & Politik — nur wenn vorhanden, ausklappbar */}
          {!isMangel && displayResponses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
            <button onClick={() => setShowResponses(!showResponses)} className="w-full flex items-center justify-between px-6 py-4 text-left">
              <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <ShieldCheck size={16} className="text-blue-500" />
                Antworten von Stadt & Politik
                <span className="text-xs font-medium text-gray-400">{displayResponses.length}</span>
              </span>
              <ChevronDown size={16} className={`text-gray-300 transition-transform ${showResponses ? 'rotate-180' : ''}`} />
            </button>
            {showResponses && (
            <div className="px-6 pb-5 flex flex-col gap-4">
              {displayResponses.map(r => {
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
            )}
          </div>
          )}

          {/* Details & Verlauf — Strukturdaten, Adressaten und Prozessstand gebündelt */}
          <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
            <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between px-6 py-4 text-left">
              <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <Info size={16} className="text-blue-500" />
                Details & Verlauf
              </span>
              <ChevronDown size={16} className={`text-gray-300 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            {showDetails && (
            <div className="px-6 pb-5">
            {demand.addressees && demand.addressees.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Adressiert an</div>
                <div className="flex flex-wrap gap-2">
                  {demand.addressees.map(a => (
                    <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {detailRows.length > 0 && (
              <div className="divide-y divide-gray-50 mb-4">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="py-2.5 flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-400 shrink-0">{label}</span>
                    <span className="text-sm text-gray-700 text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Aktueller Prozessstand</div>
            {isZurueckgezogen ? (
              <div className="flex items-center gap-3 text-gray-600 bg-gray-100 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} /> Vom Autor zurückgezogen
              </div>
            ) : isAbgelehnt ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm font-medium">
                <AlertCircle size={16} /> Diese Forderung wurde nicht weiterverfolgt
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {(isMangel ? MANGEL_STEPS : PROCESS_STEPS).map((step, i) => {
                  const stepIndex = isMangel ? (MANGEL_STATUS_TO_STEP[demand.status] ?? 0) : currentStep
                  const done = i < stepIndex
                  const active = i === stepIndex
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
            )}
          </div>

        </div>
      </main>
    </>
  )
}
