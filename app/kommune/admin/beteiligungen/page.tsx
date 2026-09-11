import Link from 'next/link'
import { PROCESSES, STATUS_META, MODULE_LABEL, formatDate, type ParticipationProcess } from '@/lib/kommune/demo'
import { Plus, Eye } from 'lucide-react'

// Kurzform des „Typs" aus den aktivierten Modulen.
function typLabel(p: ParticipationProcess): string {
  if (p.modules.includes('buergerbudget')) return 'Bürgerbudget'
  if (p.modules.includes('varianten')) return 'Variantenvergleich'
  if (p.modules.includes('karte') && p.modules.includes('ideen')) return 'Kartendialog'
  if (p.modules.includes('ideen')) return 'Ideensammlung'
  if (p.modules.includes('umfrage')) return 'Umfrage'
  return MODULE_LABEL[p.modules[0]] ?? 'Information'
}

export default function AdminBeteiligungen() {
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
            {PROCESSES.map(p => (
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
                <td className="px-5 py-3 text-gray-600">{p.end ? formatDate(p.end) : '–'}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/beteiligungen/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
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
