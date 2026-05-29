'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { ThumbsUp, ChevronLeft, CheckCircle, Circle, AlertCircle, Building2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const VOTE_THRESHOLD = 300

const PROCESS_STEPS = [
  { key: 'eingereicht',  label: 'Eingereicht',               description: 'Forderung wurde eingereicht' },
  { key: 'geprüft',      label: 'Relevanz wird gesammelt',   description: 'Bürger können unterstützen' },
  { key: 'adressiert',   label: 'Antworten laufen',          description: 'Politik und Verwaltung wurden adressiert' },
  { key: 'priorisierung',label: 'Bürgerpriorisierung möglich', description: 'Lösungsoptionen können verglichen werden' },
  { key: 'bearbeitet',   label: 'In politischer Beratung',   description: 'Wird politisch behandelt' },
  { key: 'umgesetzt',    label: 'Ergebnis dokumentiert',     description: 'Abschließende Dokumentation' },
]

const STATUS_TO_STEP: Record<string, number> = {
  eingereicht: 0,
  geprüft:     1,
  bearbeitet:  4,
  umgesetzt:   5,
  abgelehnt:   -1,
}

const POSITION_STYLES: Record<string, { bg: string; label: string }> = {
  'unterstützt': { bg: 'bg-green-100 text-green-700',  label: 'Unterstützt' },
  'lehnt ab':    { bg: 'bg-red-100 text-red-600',      label: 'Lehnt ab' },
  'prüft':       { bg: 'bg-yellow-100 text-yellow-700',label: 'Prüft' },
  'alternative': { bg: 'bg-blue-100 text-blue-700',    label: 'Schlägt Alternative vor' },
}

// Demo-Daten politische Antworten
const DEMO_RESPONSES = [
  {
    id: '1',
    author: 'Sarah Müller',
    party: 'SPD',
    role: 'Bezirksbürgermeisterin',
    type: 'politik' as const,
    addressedTo: 'Stadtplanungsamt Köln',
    position: 'prüft',
    content: 'Wir haben diese Forderung ernst genommen und an das Stadtplanungsamt weitergeleitet. Eine Rückmeldung erwarten wir bis Ende des Quartals.',
    date: '2026-05-10',
  },
]

// Demo-Daten Bürgerbeiträge
const DEMO_ARGUMENTS = [
  { id: '1', type: 'pro',         author: 'Anwohnerin, 34', content: 'Als Mutter mit zwei Kindern wäre das eine enorme Erleichterung. Der Lärm nachts ist wirklich ein Problem.', date: '2026-05-08' },
  { id: '2', type: 'contra',      author: 'Anwohner, 52',   content: 'Die Umsetzung würde den Lieferverkehr erheblich behindern. Hier braucht es eine differenziertere Lösung.', date: '2026-05-09' },
  { id: '3', type: 'alternative', author: 'Bürger, 41',     content: 'Statt kompletter Sperrung: Lärmschutz und Tempo 20 in den Nachtstunden wäre weniger einschneidend.', date: '2026-05-11' },
]

type Demand = {
  id: string
  title: string
  description: string | null
  category: string | null
  supports: number
  status: string
  created_at: string
}

export default function ForderungDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [activeTab, setActiveTab] = useState<'pro' | 'contra' | 'alternative'>('pro')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const { data } = await supabase.from('demands').select('*').eq('id', id).single()
      setDemand(data)

      if (uid) {
        const { data: support } = await supabase
          .from('demand_supports').select('id').eq('demand_id', id).eq('user_id', uid).single()
        setIsSupported(!!support)
      }
      setLoading(false)
    }
    load()
  }, [id])

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
      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
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

  const progress = Math.min((demand.supports / VOTE_THRESHOLD) * 100, 100)
  const currentStep = STATUS_TO_STEP[demand.status] ?? 0
  const isAbgelehnt = demand.status === 'abgelehnt'

  const tabCounts = {
    pro:         DEMO_ARGUMENTS.filter(a => a.type === 'pro').length,
    contra:      DEMO_ARGUMENTS.filter(a => a.type === 'contra').length,
    alternative: DEMO_ARGUMENTS.filter(a => a.type === 'alternative').length,
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-10">

          <Link href="/forderungen" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
            <ChevronLeft size={15} />
            Alle Forderungen
          </Link>

          {/* ① Was wird gefordert */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              {demand.category && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{demand.category}</span>
              )}
              <span className="text-xs text-gray-400">Köln · Neustadt-Süd</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{demand.title}</h1>
            {demand.description ? (
              <p className="text-gray-600 text-sm leading-relaxed">{demand.description}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">Keine Beschreibung hinterlegt.</p>
            )}
          </div>

          {/* ② Relevanz & Unterstützung */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Relevanz</div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{demand.supports}</div>
                <div className="text-sm text-gray-500 mt-0.5">Bürger halten dieses Anliegen für relevant</div>
              </div>
              <button
                onClick={toggleSupport}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isSupported
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ThumbsUp size={15} className={isSupported ? 'fill-white' : ''} />
                {isSupported ? 'Relevant markiert' : 'Als relevant markieren'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-400 shrink-0">{demand.supports} / {VOTE_THRESHOLD} für Bürgerpriorisierung</span>
            </div>
          </div>

          {/* ③ Prozess-Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">Prozessstatus</div>
            {isAbgelehnt ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-xl px-4 py-3">
                <AlertCircle size={17} />
                <span className="text-sm font-medium">Diese Forderung wurde nicht weiterverfolgt</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {PROCESS_STEPS.map((step, i) => {
                  const done = i < currentStep
                  const active = i === currentStep
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {done ? (
                          <CheckCircle size={18} className="text-blue-600" />
                        ) : active ? (
                          <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <Circle size={18} className="text-gray-200" />
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${active ? 'text-blue-600' : done ? 'text-gray-700' : 'text-gray-300'}`}>
                          {step.label}
                        </div>
                        {active && (
                          <div className="text-xs text-gray-400 mt-0.5">{step.description}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ④ Politische Antworten */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Politische & administrative Antworten</div>
            {DEMO_RESPONSES.length > 0 ? (
              <div className="flex flex-col gap-4">
                {DEMO_RESPONSES.map(r => {
                  const pos = POSITION_STYLES[r.position]
                  return (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {r.type === 'politik' ? <User size={14} className="text-gray-500" /> : <Building2 size={14} className="text-gray-500" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{r.author}</div>
                            <div className="text-xs text-gray-400">{r.role} · {r.party}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pos?.bg ?? 'bg-gray-100 text-gray-600'}`}>
                            {pos?.label ?? r.position}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{r.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {r.addressedTo && (
                          <span>Adressiert an: <span className="text-gray-600">{r.addressedTo}</span></span>
                        )}
                        <span>{new Date(r.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-400">
                Noch keine Antworten — Politik und Verwaltung wurden noch nicht adressiert.
              </div>
            )}
          </div>

          {/* ⑤ Bürgerbeiträge */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bürgerbeiträge</div>
            <p className="text-xs text-gray-400 mb-4">Strukturierte Beiträge — kein offenes Kommentarfeld.</p>

            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-4">
              {(['pro', 'contra', 'alternative'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'pro' && `Unterstützend (${tabCounts.pro})`}
                  {tab === 'contra' && `Gegenargument (${tabCounts.contra})`}
                  {tab === 'alternative' && `Alternative (${tabCounts.alternative})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {DEMO_ARGUMENTS.filter(a => a.type === activeTab).map(arg => (
                <div key={arg.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">{arg.author}</span>
                    <span className="text-xs text-gray-400">{new Date(arg.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{arg.content}</p>
                </div>
              ))}
              {DEMO_ARGUMENTS.filter(a => a.type === activeTab).length === 0 && (
                <div className="text-center py-6 text-sm text-gray-400">Noch keine Beiträge in dieser Kategorie.</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
