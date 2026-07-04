'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ThumbsUp, Plus, MessageSquare, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const RELEVANCE_THRESHOLD = 50

const statusColors: Record<string, string> = {
  eingereicht: 'bg-gray-100 text-gray-500',
  geprüft:     'bg-yellow-100 text-yellow-700',
  bearbeitet:  'bg-blue-100 text-blue-700',
  umgesetzt:   'bg-green-100 text-green-700',
  abgelehnt:   'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  eingereicht: 'Eingereicht',
  geprüft:     'Geprüft',
  bearbeitet:  'In Bearbeitung',
  umgesetzt:   'Umgesetzt',
  abgelehnt:   'Abgelehnt',
}

const POSITION_LABEL: Record<string, string> = {
  gegenargument: 'Gegenargument',
  alternative:   'Alternative',
}

type Demand = {
  id: string
  title: string
  description: string | null
  category: string
  relevance_score: number
  status: string
}

export default function Forderungen() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [positions, setPositions] = useState<Record<string, string>>({})
  const [textCounts, setTextCounts] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const [{ data: demandsData }, { data: argsData }] = await Promise.all([
        supabase.from('demands').select('id, title, description, category, relevance_score, status').order('relevance_score', { ascending: false }),
        supabase.from('demand_arguments').select('demand_id, user_id, text'),
      ])

      setDemands(demandsData ?? [])

      // Textbeiträge pro Forderung zählen (Positionen ohne Text sind keine "Beiträge")
      const counts: Record<string, number> = {}
      const mine: Record<string, string> = {}
      for (const row of argsData ?? []) {
        if (row.text && row.text.trim().length > 0) counts[row.demand_id] = (counts[row.demand_id] ?? 0) + 1
      }
      setTextCounts(counts)

      if (uid) {
        const { data: own } = await supabase.from('demand_arguments').select('demand_id, type').eq('user_id', uid)
        for (const row of own ?? []) mine[row.demand_id] = row.type
        setPositions(mine)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function toggleSupport(e: React.MouseEvent, demandId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) { router.push('/login'); return }

    const current = positions[demandId]

    // Wer bereits eine andere Position hat, wechselt sie bewusst auf der Detailseite
    if (current === 'gegenargument' || current === 'alternative') {
      router.push(`/forderungen/${demandId}`)
      return
    }

    const supabase = createClient()
    const isSupporting = current === 'unterstützend'

    // optimistisch
    setDemands(prev => prev.map(d =>
      d.id === demandId ? { ...d, relevance_score: d.relevance_score + (isSupporting ? -1 : 1) } : d
    ))
    setPositions(prev => {
      const next = { ...prev }
      if (isSupporting) delete next[demandId]
      else next[demandId] = 'unterstützend'
      return next
    })

    if (isSupporting) {
      await supabase.from('demand_arguments').delete().eq('demand_id', demandId).eq('user_id', userId)
    } else {
      await supabase.from('demand_arguments').insert({ demand_id: demandId, user_id: userId, type: 'unterstützend', text: null })
    }
  }

  const categories = [...new Set(demands.map(d => d.category))].filter(Boolean)
  const filtered = demands.filter(d => activeCategory === null || d.category === activeCategory)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bürgerforderungen</h1>
              <p className="text-gray-500 mt-1">Welche Themen bewegen Köln Innenstadt?</p>
            </div>
            <Link
              href={userId ? '/forderungen/neu' : '/login'}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus size={15} />
              Einreichen
            </Link>
          </div>

          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
              >
                Alle
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((d) => {
                const position = positions[d.id]
                const isSupporting = position === 'unterstützend'
                const otherPosition = position === 'gegenargument' || position === 'alternative'
                const progress = Math.min((d.relevance_score / RELEVANCE_THRESHOLD) * 100, 100)
                const textCount = textCounts[d.id] ?? 0
                const snippet = d.description
                  ? d.description.length > 100 ? d.description.slice(0, 100) + '…' : d.description
                  : null

                return (
                  <div
                    key={d.id}
                    onClick={() => router.push(`/forderungen/${d.id}`)}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {d.category && <span className="text-xs font-medium text-gray-500">{d.category}</span>}
                      <span className="text-gray-200 text-xs">·</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {statusLabels[d.status] ?? d.status}
                      </span>
                    </div>

                    <div className="font-semibold text-gray-900 leading-snug mb-1.5">{d.title}</div>

                    {snippet && <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">{snippet}</p>}

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span>{d.relevance_score} / {RELEVANCE_THRESHOLD} Relevanzpunkte</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {otherPosition ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
                            Deine Position: {POSITION_LABEL[position]}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => toggleSupport(e, d.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSupporting ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp size={13} className={isSupporting ? 'fill-white' : ''} />
                            {isSupporting ? 'Unterstützt' : 'Unterstützen'}
                          </button>
                        )}

                        {textCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageSquare size={13} />
                            {textCount} {textCount === 1 ? 'Beitrag' : 'Beiträge'}
                          </span>
                        )}
                      </div>

                      <ChevronRight size={15} className="text-gray-300 shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-medium">Noch keine Forderungen</div>
              <div className="text-sm mt-1">Sei der Erste und reiche ein Anliegen ein.</div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
