'use client'

import { useMemo, useState } from 'react'
import { MAENGEL, MANGEL_STATUS, type Mangel, type MangelStatus } from '@/lib/kommune/admin'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

const FLOW: MangelStatus[] = ['neu', 'zugewiesen', 'in_bearbeitung', 'erledigt']

type Sort = 'neueste' | 'relevanteste' | 'offen'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'offen', label: 'Offene zuerst' },
]

export default function AdminMaengel() {
  const [rows, setRows] = useState<Mangel[]>(MAENGEL)
  const [filter, setFilter] = useState<MangelStatus | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('neueste')

  const advance = (id: string) => setRows(prev => prev.map(m => {
    if (m.id !== id) return m
    const next = FLOW[Math.min(FLOW.indexOf(m.status) + 1, FLOW.length - 1)]
    return { ...m, status: next }
  }))

  const visible = useMemo(() => {
    const filtered = rows.filter(m => filter === 'alle' || m.status === filter)
    const sorted = [...filtered]
    if (sort === 'neueste') sorted.sort((a, b) => (a.created < b.created ? 1 : -1))
    else if (sort === 'relevanteste') sorted.sort((a, b) => b.support - a.support)
    else sorted.sort((a, b) => FLOW.indexOf(a.status) - FLOW.indexOf(b.status) || (a.created < b.created ? 1 : -1))
    return sorted
  }, [rows, filter, sort])

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Mängelmeldungen</h1>
        <p className="mt-0.5 text-sm text-gray-500">Gemeldete Schäden zuweisen, bearbeiten und abschließen.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(['alle', ...FLOW] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${filter === f ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
            {f === 'alle' ? 'Alle' : MANGEL_STATUS[f].label}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <SortBar options={SORTS} value={sort} onChange={setSort} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Mangel</th>
              <th className="px-5 py-3 font-semibold">Ort</th>
              <th className="px-5 py-3 font-semibold">Kategorie</th>
              <th className="px-5 py-3 font-semibold">Bestätigt</th>
              <th className="px-5 py-3 font-semibold">Gemeldet</th>
              <th className="px-5 py-3 font-semibold">Zuständig</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/60">
                <td className="px-5 py-3"><div className="font-medium text-gray-900">{m.title}</div><div className="text-xs text-gray-400">{m.id}</div></td>
                <td className="px-5 py-3 text-gray-600">{m.location}</td>
                <td className="px-5 py-3 text-gray-600">{m.category}</td>
                <td className="px-5 py-3 text-gray-600 tabular-nums">{m.support}×</td>
                <td className="px-5 py-3 text-gray-600">{new Date(m.created).toLocaleDateString('de-DE')}</td>
                <td className="px-5 py-3 text-gray-600">{m.department}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MANGEL_STATUS[m.status].badge}`}>{MANGEL_STATUS[m.status].label}</span></td>
                <td className="px-5 py-3 text-right">
                  {m.status !== 'erledigt' ? (
                    <button onClick={() => advance(m.id)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                      {m.status === 'neu' ? 'Zuweisen' : m.status === 'zugewiesen' ? 'In Bearbeitung' : 'Erledigt'}
                    </button>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
