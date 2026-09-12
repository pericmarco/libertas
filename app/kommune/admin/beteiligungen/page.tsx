'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PROCESSES, STATUS_META, MODULE_LABEL, formatDate, daysLeft, type ParticipationProcess, type ProcessStatus } from '@/lib/kommune/demo'
import { Plus, Eye } from 'lucide-react'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

// Kurzform des „Typs" aus den aktivierten Modulen.
function typLabel(p: ParticipationProcess): string {
  if (p.modules.includes('buergerbudget')) return 'Bürgerbudget'
  if (p.modules.includes('varianten')) return 'Variantenvergleich'
  if (p.modules.includes('karte') && p.modules.includes('ideen')) return 'Kartendialog'
  if (p.modules.includes('ideen')) return 'Ideensammlung'
  if (p.modules.includes('umfrage')) return 'Umfrage'
  return MODULE_LABEL[p.modules[0]] ?? 'Information'
}

type Sort = 'neueste' | 'relevanteste' | 'endet_bald'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'endet_bald', label: 'Läuft bald aus' },
]

const STATUS_FILTER: { key: ProcessStatus | 'alle'; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'beteiligung_laeuft', label: STATUS_META.beteiligung_laeuft.label },
  { key: 'in_auswertung', label: STATUS_META.in_auswertung.label },
  { key: 'geplant', label: STATUS_META.geplant.label },
]

export default function AdminBeteiligungen() {
  const [status, setStatus] = useState<ProcessStatus | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('neueste')

  const rows = useMemo(() => {
    const filtered = PROCESSES.filter(p => status === 'alle' || p.status === status)
    const arr = [...filtered]
    if (sort === 'neueste') arr.sort((a, b) => (a.start < b.start ? 1 : -1))
    else if (sort === 'relevanteste') arr.sort((a, b) => b.stats.teilnehmende - a.stats.teilnehmende)
    else {
      const rank = (p: ParticipationProcess) => {
        const l = daysLeft(p.end)
        return l != null && l > 0 && p.status === 'beteiligung_laeuft' ? l : Number.MAX_SAFE_INTEGER
      }
      arr.sort((a, b) => rank(a) - rank(b) || (a.start < b.start ? 1 : -1))
    }
    return arr
  }, [status, sort])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beteiligungen</h1>
          <p className="mt-0.5 text-sm text-gray-500">Alle Beteiligungsverfahren verwalten.</p>
        </div>
        <Link href="/admin/beteiligungen/neu" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Beteiligung erstellen
        </Link>
      </div>

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
      <div className="mb-4">
        <SortBar options={SORTS} value={sort} onChange={setSort} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Beteiligung</th>
              <th className="px-5 py-3 font-semibold">Typ</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Teilnehmende</th>
              <th className="px-5 py-3 font-semibold text-right">Beiträge</th>
              <th className="px-5 py-3 font-semibold">Ende</th>
              <th className="px-5 py-3 font-semibold text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(p => {
              const left = daysLeft(p.end)
              return (
                <tr key={p.slug} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${p.accent}`}>{p.emoji}</span>
                      <span className="font-medium text-gray-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{typLabel(p)}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_META[p.status].badge}`}>{STATUS_META[p.status].label}</span></td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-700">{p.stats.teilnehmende > 0 ? p.stats.teilnehmende.toLocaleString('de-DE') : '–'}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-700">{p.stats.beitraege > 0 ? p.stats.beitraege : '–'}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {p.end ? formatDate(p.end) : '–'}
                    {left != null && left > 0 && p.status === 'beteiligung_laeuft' && (
                      <span className="ml-1.5 text-xs text-gray-400">({left} {left === 1 ? 'Tag' : 'Tage'})</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/beteiligungen/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <Eye size={13} /> Vorschau
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
