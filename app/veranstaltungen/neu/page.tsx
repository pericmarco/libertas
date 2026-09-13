'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useCity } from '@/lib/city/context'
import { ChevronLeft, CheckCircle2, CalendarDays, Lock } from 'lucide-react'

const KINDS = ['Veranstaltung', 'Workshop', 'Infoabend', 'Ortstermin', 'Online', 'Ratssitzung', 'Sprechstunde', 'Fest']
const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

type District = { id: string; name: string }

export default function VeranstaltungNeu() {
  const city = useCity()
  const [ready, setReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('Veranstaltung')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [online, setOnline] = useState(false)
  const [location, setLocation] = useState('')
  const [address, setAddress] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [description, setDescription] = useState('')
  const [registration, setRegistration] = useState(false)
  const [capacity, setCapacity] = useState('')
  const [districtId, setDistrictId] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      if (uid) {
        const { data: profile } = await supabase.from('profiles').select('role, politician_verified').eq('id', uid).single()
        const role = profile?.role ?? 'citizen'
        setCanCreate(role === 'admin' || role === 'city' || (role === 'politician' && profile?.politician_verified === true))
      }
      const { data: d } = await supabase.from('districts').select('id, name').eq('city_id', city.id)
      setDistricts(d ?? [])
      setReady(true)
    }
    load()
  }, [city.id])

  const valid = title.trim().length >= 3 && !!date && !!startTime && (online || location.trim().length > 1)

  async function submit() {
    if (!valid) return
    setSaving(true); setError('')
    const supabase = createClient()
    const starts_at = new Date(`${date}T${startTime}`).toISOString()
    const ends_at = endTime ? new Date(`${date}T${endTime}`).toISOString() : null
    const { error: e } = await supabase.from('events').insert({
      title: title.trim(),
      description: description.trim() || null,
      kind,
      starts_at,
      ends_at,
      online,
      location: location.trim() || null,
      address: address.trim() || null,
      organizer: organizer.trim() || null,
      registration,
      capacity: registration && capacity ? Number(capacity) : null,
      district_id: districtId || null,
    })
    setSaving(false)
    if (e) { setError('Konnte nicht gespeichert werden: ' + e.message); return }
    setDone(true)
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          {!ready ? (
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ) : !canCreate ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400"><Lock size={24} /></div>
              <h1 className="text-xl font-bold text-gray-900">Nur für offizielle Accounts</h1>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                Veranstaltungen können nur von der Stadt, Verwaltung oder verifizierten Politik-Accounts angekündigt werden.
              </p>
              <Link href="/feed" className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Zum Feed</Link>
            </div>
          ) : done ? (
            <div className="px-2 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><CheckCircle2 size={30} className="text-green-600" /></div>
              <h1 className="text-2xl font-bold text-gray-900">Veranstaltung veröffentlicht</h1>
              <p className="mt-1 text-gray-500">„{title}“ erscheint jetzt im Feed und im „Heute in deiner Stadt“-Überblick.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/feed" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Zum Feed</Link>
                <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setDate(''); setStartTime(''); setEndTime('') }} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Weitere anlegen</button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
                <ChevronLeft size={15} /> Zurück
              </Link>
              <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <CalendarDays size={22} className="text-purple-600" /> Veranstaltung ankündigen
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">Ein öffentlicher Termin in {city.name} — erscheint im Feed.</p>

              <div className="mt-6 flex flex-col gap-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div><label className={labelCls}>Titel *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="z. B. Bürgersprechstunde" /></div>
                  <div className="mt-4">
                    <label className={labelCls}>Art</label>
                    <select className={inputCls} value={kind} onChange={e => setKind(e.target.value)}>
                      {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div><label className={labelCls}>Datum *</label><input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} /></div>
                    <div><label className={labelCls}>Von *</label><input type="time" className={inputCls} value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                    <div><label className={labelCls}>Bis</label><input type="time" className={inputCls} value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-700">Online-Veranstaltung</span>
                    <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition-transform checked:bg-blue-600 checked:before:translate-x-4" />
                  </label>
                  <div className="mt-4"><label className={labelCls}>{online ? 'Plattform / Hinweis' : 'Ort *'}</label><input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder={online ? 'z. B. Online (Videokonferenz)' : 'z. B. Rathaus, Ratssaal'} /></div>
                  {!online && <div className="mt-4"><label className={labelCls}>Adresse</label><input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="Straße, PLZ Ort" /></div>}
                  {districts.length > 0 && (
                    <div className="mt-4">
                      <label className={labelCls}>Stadtteil (optional)</label>
                      <select className={inputCls} value={districtId} onChange={e => setDistrictId(e.target.value)}>
                        <option value="">Ganze Stadt</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div><label className={labelCls}>Beschreibung</label><textarea rows={4} className={`${inputCls} resize-none`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Worum geht es? Was erwartet die Teilnehmenden?" /></div>
                  <div className="mt-4"><label className={labelCls}>Veranstalter</label><input className={inputCls} value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder={`z. B. Stadt ${city.name}`} /></div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span><span className="block text-sm font-medium text-gray-700">Anmeldung erforderlich</span><span className="block text-xs text-gray-400">Begrenzte Teilnehmerzahl</span></span>
                    <input type="checkbox" checked={registration} onChange={e => setRegistration(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-200 transition-colors before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition-transform checked:bg-blue-600 checked:before:translate-x-4" />
                  </label>
                  {registration && <div className="mt-4"><label className={labelCls}>Plätze</label><input type="number" min={1} className={`${inputCls} max-w-40`} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="z. B. 40" /></div>}
                </div>

                {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

                <div className="flex items-center justify-end gap-3">
                  <Link href="/feed" className="rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">Abbrechen</Link>
                  <button onClick={submit} disabled={!valid || saving} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                    {saving ? 'Wird veröffentlicht…' : 'Veröffentlichen'}
                  </button>
                </div>
                {!valid && <p className="-mt-2 text-right text-xs text-gray-400">Titel, Datum, Uhrzeit{online ? '' : ' und Ort'} sind erforderlich.</p>}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
