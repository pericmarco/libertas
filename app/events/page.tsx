import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { ChevronLeft, CalendarDays, Clock, MapPin, Video } from 'lucide-react'

function startOfTodayIso(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString()
}

export default async function Events() {
  const supabase = await createClient()
  const city = await getCurrentCity()

  const { data } = await supabase.from('events')
    .select('id, title, description, kind, starts_at, ends_at, location, online, organizer')
    .eq('city_id', city.id)
    .gte('starts_at', startOfTodayIso())
    .order('starts_at', { ascending: true })
    .limit(50)
  const events = data ?? []

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          <Link href="/ueberblick" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
            <ChevronLeft size={15} /> Stadt
          </Link>
          <div className="mt-3 mb-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <CalendarDays size={22} className="text-blue-600" /> Events
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Was in {city.name} ansteht — Termine von Stadt und Politik.</p>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <div className="mb-2 text-3xl">📅</div>
              <div className="font-medium text-gray-700">Aktuell keine Events</div>
              <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-gray-500">
                Sobald Stadt oder Politik einen Termin ankündigen, erscheint er hier.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map(e => {
                const d = new Date(e.starts_at)
                return (
                  <div key={e.id} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50 py-2 text-purple-700">
                      <span className="text-[10px] font-semibold uppercase leading-none">{d.toLocaleDateString('de-DE', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-tight">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">{e.kind}</span>
                        {e.organizer && <span className="text-xs text-gray-400">{e.organizer}</span>}
                      </div>
                      <div className="mt-1 font-semibold text-gray-900">{e.title}</div>
                      {e.description && <p className="mt-0.5 text-sm leading-relaxed text-gray-500 line-clamp-2">{e.description}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} · {d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                        <span className="inline-flex items-center gap-1">{e.online ? <Video size={13} /> : <MapPin size={13} />} {e.online ? 'Online' : (e.location ?? 'Vor Ort')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
