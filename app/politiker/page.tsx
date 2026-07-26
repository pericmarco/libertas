'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import { Search, BadgeCheck, MessageCircle, ChevronRight, Landmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Politician, POLITICIAN_COLUMNS, partyColor, onPartyText, initials } from '@/lib/politiker'

export default function PolitikerVerzeichnis() {
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [party, setParty] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('politicians_public')
      .select(POLITICIAN_COLUMNS)
      .order('verified', { ascending: false })
      .order('name')
      .then(({ data }) => {
        if (data) setPoliticians(data as Politician[])
        setLoading(false)
      })
  }, [])

  const parties = useMemo(
    () => [...new Set(politicians.map(p => p.party).filter(Boolean) as string[])].sort(),
    [politicians]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return politicians.filter(p => {
      if (party && p.party !== party) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.role ?? '').toLowerCase().includes(q) ||
        (p.constituency ?? '').toLowerCase().includes(q) ||
        (p.party ?? '').toLowerCase().includes(q) ||
        (p.topics ?? []).some(t => t.toLowerCase().includes(q))
      )
    })
  }, [politicians, query, party])

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

          {/* Kopf */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={20} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Politik-Verzeichnis</h1>
            </div>
            <p className="text-gray-500">
              Wer vertritt dich vor Ort? Finde deine Mandatsträger:innen, ihre Schwerpunkte
              und wie verlässlich sie auf Anliegen reagieren.
            </p>
          </div>

          {/* Suche + Parteifilter */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nach Name, Funktion oder Thema suchen…"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {parties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParty(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    party === null
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  Alle Parteien
                </button>
                {parties.map(pt => {
                  const active = party === pt
                  return (
                    <button
                      key={pt}
                      onClick={() => setParty(active ? null : pt)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                      style={
                        active
                          ? { background: partyColor(pt), color: onPartyText(pt), borderColor: partyColor(pt) }
                          : { background: '#fff', color: '#4B5563', borderColor: '#E5E7EB' }
                      }
                    >
                      {pt}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Demo-Parteiprofil (frontend-only) — Showcase für Vermarktung/Musterstadt */}
          <Link
            href="/politiker/beispiel"
            className="mb-6 block rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Image src="/demo/partei-logo.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0" unoptimized />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-gray-900">Lybertas Beispielpartei</span>
                  <BadgeCheck size={16} className="shrink-0 text-blue-500" />
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Beispiel</span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Fortschritt. Zusammenhalt. Köln.</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Fortschrittlich', 'Transparent', 'Bürgernah'].map(t => (
                    <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{t}</span>
                  ))}
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-gray-300" />
            </div>
          </Link>

          {/* Liste */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {politicians.length === 0
                ? 'Noch keine Einträge im Verzeichnis.'
                : 'Keine Treffer für diese Suche.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <Link
                  key={p.id}
                  href={`/politiker/${p.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm hover:border-gray-200 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: partyColor(p.party), color: onPartyText(p.party) }}
                      >
                        {initials(p.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 truncate">{p.name}</span>
                        {p.verified && <BadgeCheck size={15} className="text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{p.role ?? p.constituency ?? '—'}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {p.party && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: partyColor(p.party), color: onPartyText(p.party) }}
                      >
                        {p.party}
                      </span>
                    )}
                    {(p.topics ?? []).slice(0, 2).map(t => (
                      <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <MessageCircle size={13} /> {p.response_rate}% Reaktion
                    </span>
                    <span className="text-blue-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Profil <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Hinweis für Mandatsträger:innen */}
          <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-blue-900">
              <span className="font-semibold">Sie sind Mandatsträger:in?</span>{' '}
              Melden Sie sich an, um Ihren Eintrag selbst aktuell zu halten.
            </div>
            <Link
              href="/politiker/mein-profil"
              className="shrink-0 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors text-center"
            >
              Eintrag verwalten
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}
