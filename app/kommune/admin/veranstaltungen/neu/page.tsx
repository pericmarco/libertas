'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, CalendarDays, Clock, MapPin, Video } from 'lucide-react'
import { EVENT_KIND, longDate, type EventKind } from '@/lib/kommune/events'
import { PROCESSES } from '@/lib/kommune/demo'

const KINDS: EventKind[] = ['Workshop', 'Infoabend', 'Ortstermin', 'Online', 'Ratssitzung', 'Sprechstunde', 'Fest']

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

export default function VeranstaltungNeu() {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EventKind>('Workshop')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [online, setOnline] = useState(false)
  const [place, setPlace] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [registration, setRegistration] = useState(false)
  const [capacity, setCapacity] = useState('')
  const [processSlug, setProcessSlug] = useState('')
  const [done, setDone] = useState(false)

  const valid = title.trim().length >= 3 && !!date && !!time && (online || place.trim().length > 1)

  if (done) {
    const kindMeta = EVENT_KIND[kind]
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900">Veranstaltung angelegt</h1>
        <p className="mt-1 text-gray-500">„{title}“ wurde erstellt und würde jetzt im Kalender erscheinen.</p>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 text-left">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${kindMeta.badge}`}>{kind}</span>
          <div className="mt-2 font-semibold text-gray-900">{title}</div>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-blue-600" /> {date ? longDate(date) : '—'}</span>
            <span className="inline-flex items-center gap-2"><Clock size={14} className="text-blue-600" /> {time || '—'}{endTime ? `–${endTime}` : ''} Uhr</span>
            <span className="inline-flex items-center gap-2">{online ? <Video size={14} className="text-blue-600" /> : <MapPin size={14} className="text-blue-600" />} {online ? 'Online' : place || '—'}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">Demo · Die Veranstaltung wird nicht dauerhaft gespeichert.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin/veranstaltungen" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300">Zur Übersicht</Link>
          <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setDate(''); setTime('') }} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Weitere anlegen</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link href="/admin/veranstaltungen" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
        <ChevronLeft size={16} /> Veranstaltungen
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">Veranstaltung erstellen</h1>
      <p className="mt-0.5 text-sm text-gray-500">Neuen Termin für das Beteiligungsportal anlegen.</p>

      <div className="mt-6 flex flex-col gap-5">
        {/* Titel & Art */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div>
            <label className={labelCls}>Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Bürgerwerkstatt Marktplatz" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Art der Veranstaltung</label>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => { setKind(k); if (k === 'Online') setOnline(true) }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${kind === k ? 'border-transparent bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_KIND[k].dot }} /> {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datum & Zeit */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Datum *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Von *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bis</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Ort */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700">Online-Veranstaltung</span>
            <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition-transform checked:bg-blue-600 checked:before:translate-x-4" />
          </label>
          <div className="mt-4">
            <label className={labelCls}>{online ? 'Plattform / Hinweis' : 'Ort *'}</label>
            <input value={place} onChange={e => setPlace(e.target.value)} placeholder={online ? 'z. B. Online (Videokonferenz)' : 'z. B. Rathaus, Ratssaal'} className={inputCls} />
          </div>
          {!online && (
            <div className="mt-4">
              <label className={labelCls}>Adresse</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Straße, PLZ Ort" className={inputCls} />
            </div>
          )}
        </div>

        {/* Beschreibung & Veranstalter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div>
            <label className={labelCls}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Worum geht es? Was erwartet die Teilnehmenden?" className={`${inputCls} resize-none`} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Veranstalter</label>
            <input value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="z. B. Stadtplanungsamt" className={inputCls} />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Zu Beteiligung zuordnen (optional)</label>
            <select value={processSlug} onChange={e => setProcessSlug(e.target.value)} className={inputCls}>
              <option value="">– keine –</option>
              {PROCESSES.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          </div>
        </div>

        {/* Anmeldung */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-medium text-gray-700">Anmeldung erforderlich</span>
              <span className="block text-xs text-gray-400">Begrenzte Teilnehmerzahl mit Warteliste</span>
            </span>
            <input type="checkbox" checked={registration} onChange={e => setRegistration(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition-transform checked:bg-blue-600 checked:before:translate-x-4" />
          </label>
          {registration && (
            <div className="mt-4">
              <label className={labelCls}>Plätze (Kapazität)</label>
              <input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="z. B. 80" className={`${inputCls} max-w-40`} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/veranstaltungen" className="rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">Abbrechen</Link>
          <button
            onClick={() => valid && setDone(true)}
            disabled={!valid}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Veranstaltung veröffentlichen
          </button>
        </div>
        {!valid && <p className="-mt-2 text-right text-xs text-gray-400">Titel, Datum, Uhrzeit{online ? '' : ' und Ort'} sind erforderlich.</p>}
      </div>
    </main>
  )
}
