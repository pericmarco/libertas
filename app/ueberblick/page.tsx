import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { tenant } from '@/lib/tenant'
import StadtteilCard from '@/components/StadtteilCard'
import PolitischeVertretung from '@/components/PolitischeVertretung'
import ElectionsCard from '@/components/ElectionsCard'
import { Users, LayoutDashboard, TrendingUp, CalendarDays, Clock, MapPin, Video, ChevronRight, type LucideIcon } from 'lucide-react'

function LinkCard({ href, icon: Icon, tint, title, desc }: { href: string; icon: LucideIcon; tint: string; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-gray-900">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-300" />
    </Link>
  )
}

function startOfTodayIso(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString()
}

// „Stadt" — lokaler Hub: Politik & Akteure, Veranstaltungen, Rat & Wahlen.
export default async function Stadt() {
  const supabase = await createClient()
  const city = await getCurrentCity()
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id ?? null

  const { data: districts } = await supabase
    .from('districts').select('id, name').eq('city_id', city.id).not('region_id', 'is', null)

  const [{ data: profile }, { data: elections }, { data: eventsData }] = await Promise.all([
    uid ? supabase.from('profiles').select('district_id').eq('id', uid).single() : Promise.resolve({ data: null }),
    supabase.from('elections').select('id, title, election_date, expected_year, description').eq('city_id', city.id),
    supabase.from('events').select('id, title, kind, starts_at, location, online').eq('city_id', city.id).gte('starts_at', startOfTodayIso()).order('starts_at', { ascending: true }).limit(4),
  ])
  const meinStadtteil = districts?.find(d => d.id === profile?.district_id)?.name ?? null
  const events = eventsData ?? []
  const isKoeln = tenant.productLine === 'city' && city.slug === 'koeln'

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Stadt</h1>
            <p className="mt-0.5 text-sm text-gray-500">Politik, Veranstaltungen und Zahlen aus {city.name}</p>
          </div>

          {/* 1) Politik & Akteure */}
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Politik &amp; Akteure</h2>
          <LinkCard
            href="/politiker"
            icon={Users}
            tint="bg-purple-50 text-purple-600"
            title="Parteien &amp; politische Akteure"
            desc="Profile, Zuständigkeiten, Veranstaltungen und Reaktionsquoten in deiner Stadt."
          />

          {/* 2) Veranstaltungen */}
          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Veranstaltungen</h2>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400"><CalendarDays size={13} /> demnächst</span>
          </div>
          {events.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {events.map(e => {
                const d = new Date(e.starts_at)
                return (
                  <div key={e.id} className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50 py-1.5 text-purple-700">
                      <span className="text-[10px] font-semibold uppercase leading-none">{d.toLocaleDateString('de-DE', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">{e.kind}</span>
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-gray-900">{e.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                        <span className="inline-flex items-center gap-1">{e.online ? <Video size={13} /> : <MapPin size={13} />} {e.online ? 'Online' : (e.location ?? 'Vor Ort')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
              Aktuell sind keine Veranstaltungen angekündigt.
            </div>
          )}

          {/* 3) Rat & Wahlen */}
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Rat &amp; Wahlen</h2>
          {tenant.productLine === 'city' && <ElectionsCard elections={elections ?? []} />}
          {isKoeln && <PolitischeVertretung />}
          {isKoeln && <StadtteilCard defaultName={meinStadtteil} />}

          {/* 4) Mehr */}
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Mehr</h2>
          <div className="flex flex-col gap-3">
            <LinkCard href="/dashboard" icon={LayoutDashboard} tint="bg-blue-50 text-blue-600" title="Vollständiges Dashboard" desc="Deine Beteiligung, Neuigkeiten und Statistiken im Detail." />
            <LinkCard href="/wirkung" icon={TrendingUp} tint="bg-emerald-50 text-emerald-600" title="Wirkung" desc="Was aus Beteiligung geworden ist — Reaktionen und Umsetzungen." />
          </div>
        </div>
      </main>
    </>
  )
}
