'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Wrench, Plus, MapPin, ThumbsUp, Clock } from 'lucide-react'
import { MAENGEL, MANGEL_STATUS, type MangelStatus } from '@/lib/kommune/admin'
import type { LngLat, MapPin as MapPinT } from '@/components/MapView'
import MapPanel from '@/components/MapPanel'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

const CENTER: LngLat = { lng: 6.83, lat: 51.10 }
const FLOW: MangelStatus[] = ['neu', 'zugewiesen', 'in_bearbeitung', 'erledigt']

type Sort = 'neueste' | 'relevanteste' | 'offen'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'offen', label: 'Offene zuerst' },
]

function relDays(iso: string): string {
  const d = Math.round((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 86_400_000)
  if (d <= 0) return 'heute'
  if (d === 1) return 'gestern'
  return `vor ${d} Tagen`
}

export default function MaengelUebersicht() {
  const [status, setStatus] = useState<MangelStatus | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('neueste')

  const list = useMemo(() => {
    const filtered = MAENGEL.filter(m => status === 'alle' || m.status === status)
    const sorted = [...filtered]
    if (sort === 'neueste') sorted.sort((a, b) => (a.created < b.created ? 1 : -1))
    else if (sort === 'relevanteste') sorted.sort((a, b) => b.support - a.support)
    else sorted.sort((a, b) => FLOW.indexOf(a.status) - FLOW.indexOf(b.status) || (a.created < b.created ? 1 : -1))
    return sorted
  }, [status, sort])

  const pins: MapPinT[] = useMemo(() => list.map(m => ({
    id: m.id, lng: m.lng, lat: m.lat, title: m.title,
    meta: `${m.category} · ${MANGEL_STATUS[m.status].label}`,
    color: MANGEL_STATUS[m.status].dot,
  })), [list])

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Wrench size={22} className="text-blue-600" /> Mängelmelder
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Bereits gemeldete Schäden im Stadtgebiet – und was daraus wird.</p>
        </div>
        <Link href="/maengel/neu" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <Plus size={16} /> Mangel melden
        </Link>
      </div>

      {/* Karte aller Meldungen */}
      <MapPanel pins={pins} center={CENTER} zoom={13} title="Gemeldete Mängel" className="h-[46vh] min-h-[300px] w-full" />

      {/* Statusfilter */}
      <div className="mt-5 mb-2 flex flex-wrap gap-2">
        {(['alle', ...FLOW] as const).map(f => {
          const on = status === f
          const count = f === 'alle' ? MAENGEL.length : MAENGEL.filter(m => m.status === f).length
          return (
            <button key={f} onClick={() => setStatus(f)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              {f !== 'alle' && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MANGEL_STATUS[f].dot }} />}
              {f === 'alle' ? 'Alle' : MANGEL_STATUS[f].label}
              <span className={`text-xs ${on ? 'text-blue-100' : 'text-gray-400'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Sortierung */}
      <div className="mb-4">
        <SortBar options={SORTS} value={sort} onChange={setSort} />
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {list.map(m => (
          <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: MANGEL_STATUS[m.status].dot + '1a', color: MANGEL_STATUS[m.status].dot }}>
              <MapPin size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MANGEL_STATUS[m.status].badge}`}>{MANGEL_STATUS[m.status].label}</span>
                <span className="text-xs text-gray-400">{m.category}</span>
              </div>
              <div className="mt-0.5 truncate font-semibold text-gray-900">{m.title}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1"><MapPin size={13} /> {m.location}</span>
                <span className="inline-flex items-center gap-1"><Clock size={13} /> {relDays(m.created)}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700"><ThumbsUp size={14} className="text-gray-400" /> {m.support}</div>
              <div className="text-[10px] text-gray-400">auch betroffen</div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Keine Meldungen mit diesem Status.</p>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">Beispielhafte Meldungen · alle Inhalte sind fiktiv</p>
    </main>
  )
}
