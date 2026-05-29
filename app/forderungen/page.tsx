'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { ThumbsUp, Plus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const VOTE_THRESHOLD = 300

const CATEGORIES = ['Verkehr', 'Umwelt', 'Sicherheit', 'Freizeit', 'Bildung', 'Sauberkeit', 'Sonstiges']

const BLOCKED_WORDS = [
  'idiot', 'idioten', 'depp', 'vollidiot', 'dummkopf',
  'scheiß', 'scheiss', 'wichser', 'arschloch', 'arsch',
  'hurensohn', 'hure', 'fick', 'ficken',
  'nazi', 'hitler', 'heil',
  'ausländer raus', 'kanake', 'nigger', 'neger',
  'jude', 'juden', 'judensau',
  'behinderter', 'behindi', 'mongo',
  'verrecke', 'krepier', 'stirb',
]

function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some(word => lower.includes(word))
}

const statusColors: Record<string, string> = {
  eingereicht: 'bg-gray-100 text-gray-600',
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
  category: string
  supports: number
  status: string
}

export default function Forderungen() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [supported, setSupported] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [districtId, setDistrictId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const { data: districtData } = await supabase
        .from('districts').select('id').eq('name', 'Neustadt-Süd').single()
      setDistrictId(districtData?.id ?? null)

      const { data: demandsData } = await supabase
        .from('demands').select('id, title, category, supports, status')
        .order('supports', { ascending: false })
      setDemands(demandsData ?? [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !districtId) return
    setSubmitting(true)
    setSubmitError('')

    if (containsBlockedContent(title) || containsBlockedContent(description)) {
      setSubmitError('Deine Forderung enthält unzulässige Ausdrücke. Bitte formuliere sie sachlich.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.from('demands').insert({
      title, description, category,
      district_id: districtId, user_id: userId,
      supports: 0, status: 'eingereicht',
    }).select('id, title, category, supports, status').single()

    if (error) {
      setSubmitError('Fehler beim Einreichen. Bitte nochmal versuchen.')
      setSubmitting(false)
      return
    }

    setDemands(prev => [data, ...prev])
    setTitle(''); setDescription(''); setCategory('')
    setShowModal(false); setSubmitting(false)
  }

  const categories = [...new Set(demands.map(d => d.category))].filter(Boolean)
  const filtered = demands.filter(d => activeCategory === null || d.category === activeCategory)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bürgerforderungen</h1>
              <p className="text-gray-500 mt-1">Welche Themen bewegen Neustadt-Süd?</p>
            </div>
            <button
              onClick={() => { if (!userId) { router.push('/login'); return } setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} />
              Einreichen
            </button>
          </div>

          {/* Kategorie Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Alle
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((d) => {
                const isSupported = supported.has(d.id)
                return (
                  <Link key={d.id} href={`/forderungen/${d.id}`}>
                    <Card className="hover:shadow-md transition-all hover:border-blue-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Support Button */}
                          <button
                            onClick={(e) => toggleSupport(e, d.id)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl transition-all min-w-[52px] shrink-0 ${
                              isSupported ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp size={16} className={isSupported ? 'fill-white' : ''} />
                            <span className="text-xs font-semibold">{d.supports}</span>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate mb-1">{d.title}</div>
                            <div className="flex items-center gap-2">
                              {d.category && (
                                <span className="text-xs text-gray-400">{d.category}</span>
                              )}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {statusLabels[d.status] ?? d.status}
                              </span>
                            </div>
                          </div>

                          <ChevronRight size={16} className="text-gray-300 shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Forderung einreichen</h2>
            <p className="text-sm text-gray-500 mb-4">Eine Forderung ist ein strukturelles kommunales Anliegen — kein Einzelproblem.</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-xs text-blue-700 leading-relaxed">
              <strong>Beispiel ✓</strong> „Unser Viertel ist dauerhaft schlecht beleuchtet und unsicher."<br />
              <strong>Kein Beispiel ✗</strong> „Die Laterne vor Hausnummer 12 ist kaputt." → Das ist ein Mängelmelder-Fall.
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Kurz und prägnant" required maxLength={100}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Warum ist das wichtig? Was soll konkret passieren?" rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategorie *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Wählen…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {submitError && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{submitError}</div>}
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
                {submitting ? 'Einreichen…' : 'Forderung einreichen'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
