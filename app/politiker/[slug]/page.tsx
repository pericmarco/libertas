'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft, BadgeCheck, Mail, Phone, Globe, MessageCircle,
  MapPin, MessageSquare, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Politician, partyColor, onPartyText, initials } from '@/lib/politiker'

// Offizielle Antwort-Labels (identisch zur Forderungs-Detailseite)
const RESPONSE_LABELS: Record<string, { label: string; bg: string }> = {
  unterstuetzung: { label: 'Unterstützung', bg: 'bg-green-100 text-green-700' },
  gegenargument:  { label: 'Gegenargument', bg: 'bg-red-100 text-red-600' },
  alternative:    { label: 'Alternative',   bg: 'bg-blue-100 text-blue-700' },
}

type Response = {
  id: string
  demand_id: string
  position: string
  text: string
  created_at: string
  demands: { title: string } | null
}

export default function PolitikerDetail() {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : ''
  const [p, setP] = useState<Politician | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .rpc('politicians_public')
        .eq('slug', slug)
        .maybeSingle()

      if (!data) { setNotFound(true); setLoading(false); return }
      const pol = data as Politician
      setP(pol)

      if (pol.claimed_by) {
        const { data: r } = await supabase
          .from('demand_responses')
          .select('id, demand_id, position, text, created_at, demands(title)')
          .eq('user_id', pol.claimed_by)
          .order('created_at', { ascending: false })
        if (r) setResponses(r as unknown as Response[])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />
          </div>
        </main>
      </>
    )
  }

  if (notFound || !p) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="font-medium text-gray-600">Eintrag nicht gefunden</div>
            <Link href="/politiker" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              Zurück zum Verzeichnis
            </Link>
          </div>
        </main>
      </>
    )
  }

  const color = partyColor(p.party)
  const showContact = p.contact_public && (p.email || p.phone || p.website)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <Link href="/politiker" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft size={16} /> Verzeichnis
          </Link>

          {/* Kopfkarte */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-2" style={{ background: color }} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar_url} alt={p.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0"
                    style={{ background: color, color: onPartyText(p.party) }}
                  >
                    {initials(p.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
                    {p.verified && (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <BadgeCheck size={13} /> Verifiziert
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {p.party && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: color, color: onPartyText(p.party) }}
                      >
                        {p.party}
                      </span>
                    )}
                    {p.role && <span className="text-sm text-gray-600">{p.role}</span>}
                  </div>
                  {p.constituency && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
                      <MapPin size={13} /> {p.constituency}
                    </div>
                  )}
                </div>
              </div>

              {/* Themen */}
              {(p.topics ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {(p.topics ?? []).map(t => (
                    <span key={t} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ab großen Bildschirmen zweispaltig: Bio + Stellungnahmen links,
              Reaktionsquote + Kontakt als klebrige Spalte rechts. Dank
              expliziter Grid-Platzierung bleibt die mobile Reihenfolge exakt. */}
          <div className="mt-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">

          {/* Bio */}
          {p.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-start-1 lg:col-span-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Über</div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.bio}</p>
            </div>
          )}

          {/* Reaktionsquote + Kontakt */}
          <div className="flex flex-col gap-4 mt-4 lg:mt-0 lg:col-start-3 lg:row-start-1 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Reaktion auf Anliegen</div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500 flex items-center gap-1"><MessageCircle size={13} /> Reaktionsquote</span>
                <span className="font-semibold text-gray-800">{p.response_rate}%</span>
              </div>
              <Progress value={p.response_rate} className="h-1.5" />
            </div>

            {showContact && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Kontakt</div>
                <div className="flex flex-col gap-2 text-sm">
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Mail size={14} className="text-gray-400" /> {p.email}
                    </a>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Phone size={14} className="text-gray-400" /> {p.phone}
                    </a>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors break-all">
                      <Globe size={14} className="text-gray-400 shrink-0" /> {p.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Offizielle Antworten */}
          {responses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4 lg:mt-0 lg:col-start-1 lg:col-span-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Offizielle Stellungnahmen ({responses.length})
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {responses.map(r => {
                  const label = RESPONSE_LABELS[r.position]
                  return (
                    <Link key={r.id} href={`/forderungen/${r.demand_id}`} className="py-3 first:pt-0 last:pb-0 group">
                      <div className="flex items-center gap-2 mb-1">
                        {label && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${label.bg}`}>{label.label}</span>}
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      {r.demands?.title && (
                        <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                          <MessageSquare size={13} className="text-gray-400" /> {r.demands.title}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.text}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          </div>{/* Ende zweispaltiges Raster */}

          {/* Selbstverwaltung */}
          <div className="mt-6 text-center">
            <Link href="/politiker/mein-profil" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <Settings size={13} /> Das ist Ihr Eintrag? Anmelden und verwalten
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}
