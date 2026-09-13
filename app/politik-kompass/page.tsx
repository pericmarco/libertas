import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { tenant } from '@/lib/tenant'
import StadtteilCard from '@/components/StadtteilCard'
import PolitischeVertretung from '@/components/PolitischeVertretung'
import ElectionsCard from '@/components/ElectionsCard'
import { ChevronLeft, Compass } from 'lucide-react'

// „Politik-Kompass": die politischen Fakten der Stadt — Sitzverteilung,
// Wahlergebnisse, Ansprechpartner. Eigener Bereich, aus dem Stadt-Hub erreichbar.
export default async function PolitikKompass() {
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
          <Link href="/ueberblick" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
            <ChevronLeft size={15} /> Stadt
          </Link>
          <div className="mt-3 mb-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Compass size={22} className="text-emerald-600" /> Politik-Kompass
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Sitzverteilung, Wahlen und wer in {city.name} regiert.</p>
          </div>

          <div className="flex flex-col gap-4">
            {tenant.productLine === 'city' && <ElectionsCard elections={elections ?? []} />}
            {isKoeln && <PolitischeVertretung />}
            {isKoeln && <StadtteilCard defaultName={meinStadtteil} />}
            {!isKoeln && tenant.productLine !== 'city' && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                Für {city.name} sind noch keine politischen Kennzahlen hinterlegt.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
