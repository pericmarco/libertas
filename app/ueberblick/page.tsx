import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { tenant } from '@/lib/tenant'
import StadtteilCard from '@/components/StadtteilCard'
import PolitischeVertretung from '@/components/PolitischeVertretung'
import ElectionsCard from '@/components/ElectionsCard'
import { Users, LayoutDashboard, TrendingUp, ChevronRight, type LucideIcon } from 'lucide-react'

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

// „Überblick" bündelt Politik/Parteien und die Stadt-/Dashboard-Inhalte.
// Reihenfolge laut Vorgabe: erst Politik & Parteien, darunter Stadt & Zahlen.
export default async function Ueberblick() {
  const supabase = await createClient()
  const city = await getCurrentCity()
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id ?? null

  const { data: districts } = await supabase
    .from('districts').select('id, name').eq('city_id', city.id).not('region_id', 'is', null)

  const [{ data: profile }, { data: elections }] = await Promise.all([
    uid ? supabase.from('profiles').select('district_id').eq('id', uid).single() : Promise.resolve({ data: null }),
    supabase.from('elections').select('id, title, election_date, expected_year, description').eq('city_id', city.id),
  ])
  const meinStadtteil = districts?.find(d => d.id === profile?.district_id)?.name ?? null

  const isKoeln = tenant.productLine === 'city' && city.slug === 'koeln'

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Überblick</h1>
            <p className="mt-0.5 text-sm text-gray-500">Politik, Zahlen und Entwicklungen aus {city.name}</p>
          </div>

          {/* 1) Politik & Parteien */}
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Politik & Parteien</h2>
          <div className="mb-4 flex flex-col gap-3">
            <LinkCard
              href="/politiker"
              icon={Users}
              tint="bg-purple-50 text-purple-600"
              title="Parteien & politische Akteure"
              desc="Profile, Zuständigkeiten und Reaktionsquoten in deiner Stadt."
            />
          </div>
          {isKoeln && <PolitischeVertretung />}

          {/* 2) Stadt & Zahlen (bisheriges Dashboard) */}
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Stadt & Zahlen</h2>
          {tenant.productLine === 'city' && <ElectionsCard elections={elections ?? []} />}
          {isKoeln && <StadtteilCard defaultName={meinStadtteil} />}

          <div className="mt-2 flex flex-col gap-3">
            <LinkCard
              href="/dashboard"
              icon={LayoutDashboard}
              tint="bg-blue-50 text-blue-600"
              title="Vollständiges Dashboard"
              desc="Deine Beteiligung, Neuigkeiten und Statistiken im Detail."
            />
            <LinkCard
              href="/wirkung"
              icon={TrendingUp}
              tint="bg-emerald-50 text-emerald-600"
              title="Wirkung"
              desc="Was aus Beteiligung geworden ist — Reaktionen und Umsetzungen."
            />
          </div>
        </div>
      </main>
    </>
  )
}
