import Link from 'next/link'
import { Plus, MapPin, Clock, Video, Users } from 'lucide-react'
import { eventsSorted, dayTile, EVENT_KIND } from '@/lib/kommune/events'

export default function AdminVeranstaltungen() {
  const all = eventsSorted()

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veranstaltungen</h1>
          <p className="mt-0.5 text-sm text-gray-500">Bürgerwerkstätten, Infoabende und Ortstermine verwalten.</p>
        </div>
        <Link href="/admin/veranstaltungen/neu" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Veranstaltung erstellen
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Veranstaltungen', value: all.length },
          { label: 'Mit Anmeldung', value: all.filter(e => e.registration).length },
          { label: 'Online-Formate', value: all.filter(e => e.online).length },
          { label: 'Anmeldungen', value: all.reduce((s, e) => s + (e.registered ?? 0), 0) },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
            <div className="text-xl font-bold text-gray-900 tabular-nums">{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {all.map(e => {
          const t = dayTile(e.date)
          const kind = EVENT_KIND[e.kind]
          return (
            <div key={e.slug} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${kind.tile}`}>
                <span className="text-[10px] font-medium uppercase leading-none opacity-80">{t.month}</span>
                <span className="text-lg font-bold leading-tight">{t.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${kind.badge}`}>{e.kind}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> {e.time} Uhr</span>
                  {e.processTitle && <span className="truncate text-xs text-gray-400">· {e.processTitle}</span>}
                </div>
                <div className="mt-0.5 font-semibold text-gray-900">{e.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">{e.online ? <Video size={13} /> : <MapPin size={13} />} {e.place}</span>
                  {e.registration && e.capacity != null && (
                    <span className="inline-flex items-center gap-1"><Users size={13} /> {e.registered ?? 0}/{e.capacity} angemeldet</span>
                  )}
                </div>
              </div>
              <div className="hidden shrink-0 gap-2 sm:flex">
                <Link href={`/veranstaltungen/${e.slug}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600">Ansehen</Link>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
