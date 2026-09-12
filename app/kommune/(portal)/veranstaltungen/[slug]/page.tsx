'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Clock, MapPin, Video, CalendarDays, Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { getEvent, longDate, EVENT_KIND } from '@/lib/kommune/events'

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>()
  const e = getEvent(slug)
  const [angemeldet, setAngemeldet] = useState(false)

  if (!e) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-gray-500">
        <p>Diese Veranstaltung gibt es nicht.</p>
        <Link href="/veranstaltungen" className="mt-3 inline-block text-blue-600 hover:underline">Zum Kalender</Link>
      </main>
    )
  }

  const kind = EVENT_KIND[e.kind]
  const frei = e.capacity ? Math.max(e.capacity - (e.registered ?? 0) - (angemeldet ? 1 : 0), 0) : null
  const belegt = e.capacity ? Math.min((e.registered ?? 0) + (angemeldet ? 1 : 0), e.capacity) : 0

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      <Link href="/veranstaltungen" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
        <ChevronLeft size={16} /> Veranstaltungskalender
      </Link>

      {/* Kopf */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${kind.badge}`}>{e.kind}</span>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{e.title}</h1>

        <dl className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-3">
            <CalendarDays size={18} className="mt-0.5 shrink-0 text-blue-600" />
            <dd className="font-medium text-gray-900">{longDate(e.date)}</dd>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-blue-600" />
            <dd className="text-gray-700">{e.time}{e.endTime ? `–${e.endTime}` : ''} Uhr</dd>
          </div>
          <div className="flex items-start gap-3">
            {e.online ? <Video size={18} className="mt-0.5 shrink-0 text-blue-600" /> : <MapPin size={18} className="mt-0.5 shrink-0 text-blue-600" />}
            <dd className="text-gray-700">
              <span className="font-medium text-gray-900">{e.place}</span>
              {e.address && <span className="block text-gray-500">{e.address}</span>}
            </dd>
          </div>
          {e.organizer && (
            <div className="flex items-start gap-3">
              <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <dd className="text-gray-700">Veranstalter: <span className="font-medium text-gray-900">{e.organizer}</span></dd>
            </div>
          )}
        </dl>
      </div>

      {/* Beschreibung */}
      <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
        <h2 className="text-base font-semibold text-gray-900">Worum geht es?</h2>
        <p className="mt-2 leading-relaxed text-gray-600">{e.description}</p>

        {e.processSlug && e.processTitle && (
          <Link
            href={`/beteiligungen/${e.processSlug}`}
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:border-blue-200"
          >
            <span className="min-w-0">
              <span className="block text-xs text-gray-400">Gehört zur Beteiligung</span>
              <span className="block truncate font-medium text-gray-900">{e.processTitle}</span>
            </span>
            <ArrowRight size={17} className="shrink-0 text-gray-300" />
          </Link>
        )}
      </div>

      {/* Anmeldung */}
      <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
        {e.registration ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">Anmeldung</h2>
              {e.capacity != null && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                  <Users size={15} /> {frei} von {e.capacity} Plätzen frei
                </span>
              )}
            </div>

            {e.capacity != null && (
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(belegt / e.capacity) * 100}%` }} />
              </div>
            )}

            {angemeldet ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2 size={18} /> Sie sind angemeldet. Eine Bestätigung erhalten Sie per E-Mail.
              </div>
            ) : (
              <button
                onClick={() => setAngemeldet(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
              >
                Jetzt anmelden
              </button>
            )}
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-gray-900">Teilnahme</h2>
            <p className="mt-2 text-sm text-gray-600">Diese Veranstaltung ist öffentlich – eine Anmeldung ist nicht erforderlich. Kommen Sie einfach vorbei.</p>
          </>
        )}
        <p className="mt-4 text-xs text-gray-400">Demo · Anmeldungen werden nicht dauerhaft gespeichert.</p>
      </div>
    </main>
  )
}
