import Link from 'next/link'
import { PROCESSES, STATUS_META, daysLeft } from '@/lib/kommune/demo'
import { MAENGEL, MODERATION_QUEUE, ACTIVITY } from '@/lib/kommune/admin'
import { MessagesSquare, MessageSquare, ShieldAlert, Wrench, Plus, ArrowRight, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const aktive = PROCESSES.filter(p => p.status === 'beteiligung_laeuft').length
  const neueBeitraege = 327
  const zurModeration = MODERATION_QUEUE.filter(q => q.status === 'offen').length
  const offeneMaengel = MAENGEL.filter(m => m.status !== 'erledigt').length

  const stats = [
    { value: aktive, label: 'Aktive Beteiligungen', icon: MessagesSquare, tint: 'bg-blue-50 text-blue-600' },
    { value: neueBeitraege, label: 'Neue Beiträge (7 Tage)', icon: MessageSquare, tint: 'bg-emerald-50 text-emerald-600' },
    { value: zurModeration, label: 'Zur Moderation', icon: ShieldAlert, tint: 'bg-amber-50 text-amber-600' },
    { value: offeneMaengel, label: 'Offene Mängel', icon: Wrench, tint: 'bg-orange-50 text-orange-600' },
  ]

  const fristen = PROCESSES.filter(p => p.end && (daysLeft(p.end) ?? 0) > 0)
    .sort((a, b) => (a.end! < b.end! ? -1 : 1)).slice(0, 4)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Übersicht</h1>
          <p className="mt-0.5 text-sm text-gray-500">Ihr Beteiligungsportal auf einen Blick.</p>
        </div>
        <Link href="/admin/beteiligungen/neu" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Beteiligung erstellen
        </Link>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}><s.icon size={20} /></span>
            <div className="mt-3 text-3xl font-bold tabular-nums text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Aktivität */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Letzte Aktivität</h2>
          <ul className="mt-4 flex flex-col divide-y divide-gray-50">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-gray-700">{a.text}</span>
                <span className="shrink-0 text-xs text-gray-400">{a.when}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/beitraege" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
            Alle Beiträge <ArrowRight size={15} />
          </Link>
        </div>

        {/* Fristen */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Anstehende Fristen</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {fristen.map(p => {
              const left = daysLeft(p.end)
              return (
                <li key={p.slug} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock size={15} /></span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-400">Endet in {left} {left === 1 ? 'Tag' : 'Tagen'} · {STATUS_META[p.status].label}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </main>
  )
}
