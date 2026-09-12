'use client'

import { useMemo, useState } from 'react'
import { PROCESSES, daysLeft, STATUS_META, type ProcessStatus } from '@/lib/kommune/demo'
import ProcessCard from '@/components/kommune/ProcessCard'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

type Sort = 'neueste' | 'relevanteste' | 'endet_bald'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'endet_bald', label: 'Läuft bald aus' },
]

// Statusfilter (nur die tatsächlich vorkommenden Stufen).
const STATUS_FILTER: { key: ProcessStatus | 'alle'; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'beteiligung_laeuft', label: STATUS_META.beteiligung_laeuft.label },
  { key: 'in_auswertung', label: STATUS_META.in_auswertung.label },
  { key: 'geplant', label: STATUS_META.geplant.label },
]

export default function BeteiligungenListe() {
  const [status, setStatus] = useState<ProcessStatus | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('endet_bald')

  const list = useMemo(() => {
    const filtered = PROCESSES.filter(p => status === 'alle' || p.status === status)
    const arr = [...filtered]
    if (sort === 'neueste') {
      arr.sort((a, b) => (a.start < b.start ? 1 : -1))
    } else if (sort === 'relevanteste') {
      arr.sort((a, b) => b.stats.teilnehmende - a.stats.teilnehmende)
    } else {
      // Läuft bald aus: laufende Verfahren mit der kürzesten Restlaufzeit zuerst,
      // danach der Rest (geplant/ausgewertet) chronologisch.
      const rank = (p: typeof arr[number]) => {
        const l = daysLeft(p.end)
        return l != null && l > 0 && p.status === 'beteiligung_laeuft' ? l : Number.MAX_SAFE_INTEGER
      }
      arr.sort((a, b) => rank(a) - rank(b) || (a.start < b.start ? 1 : -1))
    }
    return arr
  }, [status, sort])

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Beteiligungen</h1>
        <p className="mt-0.5 text-sm text-gray-500">Alle Beteiligungsverfahren Ihrer Stadt — laufend, geplant und ausgewertet.</p>
      </div>

      {/* Statusfilter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_FILTER.map(f => {
          const on = status === f.key
          return (
            <button key={f.key} onClick={() => setStatus(f.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Sortierung */}
      <div className="mb-5">
        <SortBar options={SORTS} value={sort} onChange={setSort} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(p => <ProcessCard key={p.slug} p={p} />)}
      </div>
      {list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">Keine Verfahren mit diesem Status.</p>
      )}
    </main>
  )
}
