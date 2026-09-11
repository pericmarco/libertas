'use client'

import { PROCESSES } from '@/lib/kommune/demo'
import { MAENGEL } from '@/lib/kommune/admin'
import { Download, Users, MessageSquare, Heart, Wrench } from 'lucide-react'

export default function AdminAuswertung() {
  const teilnehmende = PROCESSES.reduce((s, p) => s + p.stats.teilnehmende, 0)
  const beitraege = PROCESSES.reduce((s, p) => s + p.stats.beitraege, 0)
  const reaktionen = PROCESSES.reduce((s, p) => s + p.stats.reaktionen, 0)
  const erledigt = MAENGEL.filter(m => m.status === 'erledigt').length

  const metrics = [
    { icon: Users, tint: 'bg-blue-50 text-blue-600', value: teilnehmende.toLocaleString('de-DE'), label: 'Teilnehmende gesamt' },
    { icon: MessageSquare, tint: 'bg-emerald-50 text-emerald-600', value: beitraege.toLocaleString('de-DE'), label: 'Beiträge' },
    { icon: Heart, tint: 'bg-purple-50 text-purple-600', value: reaktionen.toLocaleString('de-DE'), label: 'Reaktionen' },
    { icon: Wrench, tint: 'bg-orange-50 text-orange-600', value: `${erledigt}/${MAENGEL.length}`, label: 'Mängel erledigt' },
  ]

  function exportCsv() {
    const header = ['Beteiligung', 'Status', 'Teilnehmende', 'Beitraege', 'Reaktionen', 'Ende']
    const rows = PROCESSES.map(p => [p.title, p.status, p.stats.teilnehmende, p.stats.beitraege, p.stats.reaktionen, p.end ?? ''])
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'auswertung-beteiligungen.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auswertung</h1>
          <p className="mt-0.5 text-sm text-gray-500">Beteiligung messen und exportieren.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
          <Download size={16} /> CSV-Export
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${m.tint}`}><m.icon size={20} /></span>
            <div className="mt-3 text-2xl font-bold tabular-nums text-gray-900">{m.value}</div>
            <div className="text-sm text-gray-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Beteiligung je Verfahren</h2>
        <div className="flex flex-col gap-3">
          {PROCESSES.filter(p => p.stats.teilnehmende > 0).sort((a, b) => b.stats.teilnehmende - a.stats.teilnehmende).map(p => {
            const max = Math.max(...PROCESSES.map(x => x.stats.teilnehmende), 1)
            return (
              <div key={p.slug}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-700">{p.title}</span><span className="tabular-nums text-gray-500">{p.stats.teilnehmende.toLocaleString('de-DE')}</span></div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(p.stats.teilnehmende / max) * 100}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
