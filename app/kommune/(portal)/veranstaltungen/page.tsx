'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, MapPin, ChevronRight, CalendarDays, Video } from 'lucide-react'
import { EVENTS_CAL, EVENT_KIND, groupByMonth, dayTile, type EventKind } from '@/lib/kommune/events'

const KINDS: EventKind[] = ['Workshop', 'Infoabend', 'Ortstermin', 'Online', 'Ratssitzung', 'Sprechstunde', 'Fest']

export default function Veranstaltungskalender() {
  const [filter, setFilter] = useState<EventKind | null>(null)

  const months = useMemo(() => {
    const list = filter ? EVENTS_CAL.filter(e => e.kind === filter) : EVENTS_CAL
    return groupByMonth(list)
  }, [filter])

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <CalendarDays size={24} className="text-blue-600" /> Veranstaltungskalender
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Bürgerwerkstätten, Infoabende, Ortstermine und mehr – zum Anklicken.</p>
      </div>

      {/* Filter nach Art */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${filter === null ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
        >
          Alle
        </button>
        {KINDS.map(k => {
          const on = filter === k
          return (
            <button
              key={k}
              onClick={() => setFilter(on ? null : k)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_KIND[k].dot }} /> {k}
            </button>
          )
        })}
      </div>

      {months.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
          Keine Veranstaltungen in dieser Kategorie.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {months.map(m => (
          <section key={m.key}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{m.label}</h2>
            <div className="flex flex-col gap-3">
              {m.events.map(e => {
                const t = dayTile(e.date)
                const kind = EVENT_KIND[e.kind]
                return (
                  <Link
                    key={e.slug}
                    href={`/veranstaltungen/${e.slug}`}
                    className="group flex items-stretch gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-xl ${kind.tile}`}>
                      <span className="text-[10px] font-medium uppercase leading-none opacity-80">{t.weekday}</span>
                      <span className="text-xl font-bold leading-tight">{t.day}</span>
                      <span className="text-[10px] font-medium uppercase leading-none opacity-80">{t.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${kind.badge}`}>{e.kind}</span>
                        {e.processTitle && (
                          <span className="truncate text-[11px] text-gray-400">zu: {e.processTitle}</span>
                        )}
                      </div>
                      <div className="mt-1 font-semibold text-gray-900 group-hover:text-blue-700">{e.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {e.time}{e.endTime ? `–${e.endTime}` : ''} Uhr</span>
                        <span className="inline-flex items-center gap-1">
                          {e.online ? <Video size={13} /> : <MapPin size={13} />} {e.place}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="my-auto shrink-0 text-gray-300 transition-colors group-hover:text-blue-400" />
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-gray-400">
        Beispielhafter Kalender · alle Termine sind fiktiv
      </p>
    </main>
  )
}
