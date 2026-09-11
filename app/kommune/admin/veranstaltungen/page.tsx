import { EVENTS } from '@/lib/kommune/detail'
import { getProcess } from '@/lib/kommune/demo'
import { Plus, MapPin } from 'lucide-react'

export default function AdminVeranstaltungen() {
  const all = Object.entries(EVENTS).flatMap(([slug, list]) =>
    list.map(e => ({ ...e, process: getProcess(slug)?.title ?? '' })),
  ).sort((a, b) => (a.date < b.date ? -1 : 1))

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veranstaltungen</h1>
          <p className="mt-0.5 text-sm text-gray-500">Bürgerwerkstätten, Infoabende und Ortstermine verwalten.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Veranstaltung
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {all.map(e => (
          <div key={e.title} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <span className="text-[10px] uppercase">{new Date(e.date).toLocaleDateString('de-DE', { month: 'short' })}</span>
              <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{e.kind}</span>
                <span className="text-xs text-gray-400">{e.time} Uhr · {e.process}</span>
              </div>
              <div className="mt-0.5 font-semibold text-gray-900">{e.title}</div>
              <div className="inline-flex items-center gap-1 text-sm text-gray-500"><MapPin size={13} /> {e.place}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
