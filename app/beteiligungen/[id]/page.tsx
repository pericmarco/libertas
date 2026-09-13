'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import Kartendialog from '@/components/participation/Kartendialog'
import {
  STATUS_META, MODULE_LABEL, REACTION_LABEL, daysLeft, formatDate,
  DEFAULT_MAP_CATEGORIES, AVAILABLE_MODULES, type ProcessRow, type ModuleType,
} from '@/lib/participation/process'
import { ChevronLeft, Building2, UserRound, MapPin, CalendarClock, MessageSquareHeart } from 'lucide-react'
import type { LngLat } from '@/components/MapView'

// Fallback-Kartenmittelpunkt (Köln), falls das Verfahren keine Koordinaten hat.
const FALLBACK_CENTER: LngLat = { lng: 6.96, lat: 50.94 }

export default function BeteiligungDetail() {
  const { id } = useParams<{ id: string }>()
  const [p, setP] = useState<ProcessRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ModuleType>('information')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('participation_processes')
      .select('id, title, subtitle, description, status, modules, reaction_mode, results_mode, department, contact, area, starts_at, ends_at, image_url, lat, lng, created_at')
      .eq('id', id).single()
      .then(({ data }) => { setP((data as ProcessRow) ?? null); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8"><div className="h-72 animate-pulse rounded-2xl bg-gray-100" /></div>
        </main>
      </>
    )
  }

  if (!p) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-gray-500">
            <p>Dieses Beteiligungsverfahren gibt es nicht.</p>
            <Link href="/beteiligungen" className="mt-3 inline-block text-blue-600 hover:underline">Zur Übersicht</Link>
          </div>
        </main>
      </>
    )
  }

  const st = STATUS_META[p.status]
  const left = daysLeft(p.ends_at)
  const center: LngLat = p.lng != null && p.lat != null ? { lng: p.lng, lat: p.lat } : FALLBACK_CENTER
  // Nur Module zeigen, die Network schon vollständig rendert.
  const tabs = p.modules.filter(m => AVAILABLE_MODULES.includes(m))
  if (!tabs.includes('information')) tabs.unshift('information')

  const meta = [
    p.department && { icon: Building2, label: 'Zuständig', value: p.department },
    p.contact && { icon: UserRound, label: 'Ansprechpartner:in', value: p.contact },
    p.area && { icon: MapPin, label: 'Ort', value: p.area },
    p.starts_at && { icon: CalendarClock, label: 'Zeitraum', value: `${formatDate(p.starts_at)}${p.ends_at ? ' – ' + formatDate(p.ends_at) : ''}` },
    { icon: MessageSquareHeart, label: 'Reaktionen', value: REACTION_LABEL[p.reaction_mode] },
  ].filter(Boolean) as { icon: typeof Building2; label: string; value: string }[]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <Link href="/beteiligungen" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
            <ChevronLeft size={15} /> Alle Beteiligungen
          </Link>

          {/* Hero */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {p.image_url && (
              <div className="relative h-52 w-full sm:h-64">
                <Image src={p.image_url} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
              </div>
            )}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                {left != null && left > 0 && <span className="text-xs text-gray-400">noch {left} {left === 1 ? 'Tag' : 'Tage'}</span>}
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900">{p.title}</h1>
              {p.subtitle && <p className="mt-1 text-gray-500">{p.subtitle}</p>}

              {meta.length > 0 && (
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
              )}
            </div>
          </div>

          {/* Modul-Tabs */}
          {tabs.length > 1 && (
            <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map(m => (
                <button key={m} onClick={() => setTab(m)}
                  className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3.5 pb-2.5 pt-1 text-sm font-medium transition-colors ${
                    tab === m ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}>
                  {MODULE_LABEL[m]}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5">
            {tab === 'information' && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Worum geht es?</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.description || 'Keine Beschreibung hinterlegt.'}</p>
                {tabs.length > 1 && (
                  <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    So können Sie sich beteiligen: {tabs.filter(m => m !== 'information').map(m => MODULE_LABEL[m]).join(' · ')}.
                  </div>
                )}
              </div>
            )}
            {tab === 'karte' && (
              <Kartendialog
                center={center}
                prompt="Markieren Sie auf der Karte, wo Sie etwas vorschlagen, kritisieren oder loben möchten."
                categories={DEFAULT_MAP_CATEGORIES}
                initial={[]}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
