import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import ProcessCard from '@/components/participation/ProcessCard'
import type { ProcessRow } from '@/lib/participation/process'
import { ChevronLeft } from 'lucide-react'

export default async function BeteiligungenListe() {
  const supabase = await createClient()
  const city = await getCurrentCity()

  // Graceful: fehlt die Tabelle noch (Migration nicht eingespielt) → leer.
  const { data } = await supabase
    .from('participation_processes')
    .select('id, title, subtitle, description, status, modules, reaction_mode, results_mode, department, contact, area, starts_at, ends_at, image_url, lat, lng, created_at')
    .eq('city_id', city.id)
    .order('created_at', { ascending: false })

  const processes = (data ?? []) as ProcessRow[]
  const laufend = processes.filter(p => p.status === 'beteiligung_laeuft')
  const weitere = processes.filter(p => p.status !== 'beteiligung_laeuft')

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <Link href="/mitmachen" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
            <ChevronLeft size={15} /> Mitmachen
          </Link>
          <div className="mt-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Beteiligungsverfahren</h1>
            <p className="mt-0.5 text-sm text-gray-500">Offizielle Verfahren in {city.name} — informieren, mitreden, Ideen einbringen.</p>
          </div>

          {processes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <div className="mb-2 text-3xl">🗳️</div>
              <div className="font-medium text-gray-700">Aktuell keine Beteiligungsverfahren</div>
              <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-gray-500">
                Sobald {city.name} ein Verfahren startet, erscheint es hier — mit Karte, Ideen und mehr.
              </p>
            </div>
          ) : (
            <>
              {laufend.length > 0 && (
                <>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Laufend</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {laufend.map(p => <ProcessCard key={p.id} p={p} />)}
                  </div>
                </>
              )}
              {weitere.length > 0 && (
                <>
                  <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Geplant &amp; ausgewertet</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {weitere.map(p => <ProcessCard key={p.id} p={p} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
