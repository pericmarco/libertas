'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ChevronLeft, Building2, UserRound, MapPin, CalendarClock, Wallet, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { getVorhaben, VORHABEN_STATUS, KAT_META, euro, fmtMonth } from '@/lib/kommune/vorhaben'
import type { LngLat, MapPin as MapPinT } from '@/components/MapView'
import MapPanel from '@/components/MapPanel'

export default function VorhabenDetail() {
  const { slug } = useParams<{ slug: string }>()
  const v = getVorhaben(slug)

  if (!v) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center text-gray-500">
        <p>Dieses Vorhaben gibt es nicht.</p>
        <Link href="/vorhaben" className="mt-3 inline-block text-blue-600 hover:underline">Zur Übersicht</Link>
      </main>
    )
  }

  const st = VORHABEN_STATUS[v.status]
  const kat = KAT_META[v.kategorie]
  const center: LngLat | undefined = v.lng != null && v.lat != null ? { lng: v.lng, lat: v.lat } : undefined
  const pins: MapPinT[] = center ? [{ id: v.slug, lng: center.lng, lat: center.lat, title: v.title, meta: v.district, color: st.dot }] : []

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
      <Link href="/vorhaben" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
        <ChevronLeft size={16} /> Vorhaben
      </Link>

      {/* Kopf */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-gray-100 bg-white">
        {v.image && (
          <div className="relative h-52 w-full sm:h-64">
            <Image src={v.image} alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
            <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
          </div>
        )}
        <div className="p-6 sm:p-8">
          {!v.image && (
            <div className="mb-3 flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${kat.accent}`}>{kat.emoji}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
            </div>
          )}
          <div className="text-sm text-gray-400">{v.kategorie}</div>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{v.title}</h1>
          <p className="mt-1.5 text-gray-500">{v.subtitle}</p>

          <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2.5"><Building2 size={17} className="mt-0.5 shrink-0 text-blue-600" /><dd className="text-gray-700">{v.department}</dd></div>
            <div className="flex items-start gap-2.5"><UserRound size={17} className="mt-0.5 shrink-0 text-blue-600" /><dd className="text-gray-700">{v.contact}</dd></div>
            <div className="flex items-start gap-2.5"><MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" /><dd className="text-gray-700">{v.district}</dd></div>
            <div className="flex items-start gap-2.5"><CalendarClock size={17} className="mt-0.5 shrink-0 text-blue-600" /><dd className="text-gray-700">{fmtMonth(v.start)} – {v.end ? fmtMonth(v.end) : 'offen'}</dd></div>
            {v.budget != null && <div className="flex items-start gap-2.5"><Wallet size={17} className="mt-0.5 shrink-0 text-blue-600" /><dd className="text-gray-700">{euro(v.budget)}</dd></div>}
          </dl>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
        <h2 className="text-base font-semibold text-gray-900">Worum geht es?</h2>
        <p className="mt-2 leading-relaxed text-gray-600">{v.description}</p>

        {v.processSlug && v.processTitle && (
          <Link
            href={`/beteiligungen/${v.processSlug}`}
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 transition-colors hover:border-blue-300"
          >
            <span className="min-w-0">
              <span className="block text-xs text-blue-700/70">Sie können mitgestalten</span>
              <span className="block truncate font-semibold text-blue-800">{v.processTitle}</span>
            </span>
            <ArrowRight size={17} className="shrink-0 text-blue-400" />
          </Link>
        )}
      </div>

      {/* Zeitplan / Meilensteine */}
      <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
        <h2 className="text-base font-semibold text-gray-900">Zeitplan</h2>
        <ol className="mt-4">
          {v.phases.map((ph, i) => {
            const last = i === v.phases.length - 1
            return (
              <li key={ph.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {ph.state === 'done'
                    ? <CheckCircle2 size={20} className="text-green-600" />
                    : ph.state === 'current'
                    ? <span className="flex h-5 w-5 items-center justify-center"><span className="h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" /></span>
                    : <Circle size={20} className="text-gray-200" />}
                  {!last && <span className={`my-0.5 w-px flex-1 ${ph.state === 'done' ? 'bg-green-200' : 'bg-gray-100'}`} />}
                </div>
                <div className={`pb-5 ${last ? '' : ''}`}>
                  <div className={`font-medium ${ph.state === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                    {ph.label}
                    {ph.state === 'current' && <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">aktuell</span>}
                  </div>
                  {ph.date && <div className="text-xs text-gray-400">{fmtMonth(ph.date)}</div>}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Karte */}
      {center && (
        <div className="mt-5">
          <MapPanel pins={pins} center={center} zoom={14} title={v.title} className="h-64 w-full" />
        </div>
      )}

      {/* Neuigkeiten */}
      {v.updates.length > 0 && (
        <div className="mt-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
          <h2 className="text-base font-semibold text-gray-900">Neuigkeiten zum Vorhaben</h2>
          <div className="mt-4 flex flex-col gap-4">
            {v.updates.map(u => (
              <div key={u.date + u.title} className="border-l-2 border-gray-100 pl-4">
                <div className="text-xs text-gray-400">{new Date(u.date + 'T00:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div className="mt-0.5 font-medium text-gray-900">{u.title}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-400">Beispielhaftes Vorhaben · alle Inhalte sind fiktiv</p>
    </main>
  )
}
