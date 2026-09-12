'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { VORHABEN, VORHABEN_STATUS, KAT_META, euro, fmtMonth, type VorhabenStatus } from '@/lib/kommune/vorhaben'
import SortBar, { type SortOption } from '@/components/kommune/SortBar'

type Sort = 'neueste' | 'relevanteste' | 'endet_bald'
const SORTS: SortOption<Sort>[] = [
  { key: 'neueste', label: 'Neueste' },
  { key: 'relevanteste', label: 'Relevanteste' },
  { key: 'endet_bald', label: 'Fertigstellung zuerst' },
]

const STATUS_FILTER: { key: VorhabenStatus | 'alle'; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'planung', label: VORHABEN_STATUS.planung.label },
  { key: 'beteiligung', label: VORHABEN_STATUS.beteiligung.label },
  { key: 'umsetzung', label: VORHABEN_STATUS.umsetzung.label },
  { key: 'abgeschlossen', label: VORHABEN_STATUS.abgeschlossen.label },
]

export default function AdminVorhaben() {
  const [status, setStatus] = useState<VorhabenStatus | 'alle'>('alle')
  const [sort, setSort] = useState<Sort>('neueste')

  const rows = useMemo(() => {
    const filtered = VORHABEN.filter(v => status === 'alle' || v.status === status)
    const arr = [...filtered]
    if (sort === 'neueste') arr.sort((a, b) => (a.start < b.start ? 1 : -1))
    else if (sort === 'relevanteste') arr.sort((a, b) => b.interest - a.interest)
    else arr.sort((a, b) => {
      const ra = a.end && a.status !== 'abgeschlossen' ? a.end : '9999'
      const rb = b.end && b.status !== 'abgeschlossen' ? b.end : '9999'
      return ra < rb ? -1 : ra > rb ? 1 : 0
    })
    return arr
  }, [status, sort])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vorhaben</h1>
          <p className="mt-0.5 text-sm text-gray-500">Offizielle städtische Projekte verwalten – Zeitplan, Status und Beteiligung.</p>
        </div>
        <Link href="/admin/vorhaben/neu" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <Plus size={16} /> Vorhaben erstellen
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Vorhaben', value: VORHABEN.length },
          { label: 'In Umsetzung', value: VORHABEN.filter(v => v.status === 'umsetzung').length },
          { label: 'Mit Beteiligung', value: VORHABEN.filter(v => v.processSlug).length },
          { label: 'Investitionsvolumen', value: euro(VORHABEN.reduce((s, v) => s + (v.budget ?? 0), 0)) },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
            <div className="text-xl font-bold text-gray-900 tabular-nums">{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
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
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Vorhaben</th>
              <th className="px-5 py-3 font-semibold">Bereich</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Budget</th>
              <th className="px-5 py-3 font-semibold">Fertigstellung</th>
              <th className="px-5 py-3 font-semibold text-right">Interessierte</th>
              <th className="px-5 py-3 font-semibold text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(v => (
              <tr key={v.slug} className="hover:bg-gray-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${KAT_META[v.kategorie].accent}`}>{KAT_META[v.kategorie].emoji}</span>
                    <span className="font-medium text-gray-900">{v.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{v.kategorie}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VORHABEN_STATUS[v.status].badge}`}>{VORHABEN_STATUS[v.status].label}</span></td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-700">{v.budget != null ? euro(v.budget) : '–'}</td>
                <td className="px-5 py-3 text-gray-600">{v.end ? fmtMonth(v.end) : '–'}</td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-700">{v.interest.toLocaleString('de-DE')}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/vorhaben/${v.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600">
                    <Eye size={13} /> Vorschau
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
