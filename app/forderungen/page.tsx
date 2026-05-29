'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ThumbsUp, Plus, MessageSquare, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const VOTE_THRESHOLD = 300

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

type Demand = {
  id: string
  title: string
  description: string | null
  category: string
  supports: number
  status: string
}

export default function Forderungen() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [supported, setSupported] = useState<Set<string>>(new Set())
  const [argCounts, setArgCounts] = useState<Record<string, number>>({})
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
        supabase.from('demands').select('id, title, description, category, supports, status').order('supports', { ascending: false }),
        supabase.from('demand_arguments').select('demand_id'),
      ])

      setDemands(demandsData ?? [])

      const counts: Record<string, number> = {}
      for (const row of argsData ?? []) {
        counts[row.demand_id] = (counts[row.demand_id] ?? 0) + 1
      }
      setArgCounts(counts)

      if (uid) {
        const { data: supportsData } = await supabase
          .from('demand_supports').select('demand_id').eq('user_id', uid)
        setSupported(new Set(supportsData?.map(s => s.demand_id) ?? []))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function toggleSupport(e: React.MouseEvent, demandId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) { router.push('/login'); return }

    const supabase = createClient()
    const alreadySupported = supported.has(demandId)

    setDemands(prev => prev.map(d =>
      d.id === demandId ? { ...d, supports: d.supports + (alreadySupported ? -1 : 1) } : d
    ))
    setSupported(prev => {
      const next = new Set(prev)
      alreadySupported ? next.delete(demandId) : next.add(demandId)
      return next
    })

    if (alreadySupported) {
      await supabase.from('demand_supports').delete().eq('demand_id', demandId).eq('user_id', userId)
      await supabase.rpc('decrement_supports', { demand_id: demandId })
    } else {
      await supabase.from('demand_supports').insert({ demand_id: demandId, user_id: userId })
      await supabase.rpc('increment_supports', { demand_id: demandId })
    }
  }

  const categories = [...new Set(demands.map(d => d.category))].filter(Boolean)
  const filtered = demands.filter(d => activeCategory === null || d.category === activeCategory)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bürgerforderungen</h1>
              <p className="text-gray-500 mt-1">Welche Themen bewegen Neustadt-Süd?</p>
            </div>
            <Link
              href={userId ? '/forderungen/neu' : '/login'}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus size={15} />
              Einreichen
            </Link>
          </div>

          {/* Kategorie Filter */}
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

          {/* Liste */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((d) => {
                const isSupported = supported.has(d.id)
                const progress = Math.min((d.supports / VOTE_THRESHOLD) * 100, 100)
                const argCount = argCounts[d.id] ?? 0
                const snippet = d.description
                  ? d.description.length > 100 ? d.description.slice(0, 100) + '…' : d.description
                  : null

                return (
                  <Link key={d.id} href={`/forderungen/${d.id}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer p-5">

                      {/* Top row: category + status */}
                      <div className="flex items-center gap-2 mb-2">
                        {d.category && (
                          <span className="text-xs font-medium text-gray-500">{d.category}</span>
                        )}
                        <span className="text-gray-200 text-xs">·</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {statusLabels[d.status] ?? d.status}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="font-semibold text-gray-900 leading-snug mb-1.5">{d.title}</div>

                      {/* Description snippet */}
                      {snippet && (
                        <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">{snippet}</p>
                      )}

                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Bottom row: support button + stats + chevron */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => toggleSupport(e, d.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSupported
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp size={13} className={isSupported ? 'fill-white' : ''} />
                            {d.supports} Unterstützungen
                          </button>

                          {argCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MessageSquare size={13} />
                              {argCount} {argCount === 1 ? 'Beitrag' : 'Beiträge'}
                            </span>
                          )}
                        </div>

                        <ChevronRight size={15} className="text-gray-300 shrink-0" />
                      </div>

                    </div>
                  </Link>
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
