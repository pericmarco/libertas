'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useCity } from '@/lib/city/context'
import type { MapPin } from '@/components/MapView'

// Erste Ausbaustufe der Karte: Forderungen als Pins. Layer (Mängel, Umfragen,
// Projekte, Infos) und klickbare Stadtbezirks-Flächen folgen in einer späteren
// Stufe — die Struktur ist darauf ausgelegt.
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />,
})

const STATUS_LABEL: Record<string, string> = {
  eingereicht: 'Eingereicht', geprüft: 'Geprüft', bearbeitet: 'In Bearbeitung',
  umgesetzt: 'Umgesetzt', abgelehnt: 'Abgelehnt',
}

export default function KartePage() {
  const city = useCity()
  const [pins, setPins] = useState<MapPin[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('demands')
      .select('id, title, category, status, lat, lng')
      .eq('city_id', city.id)
      .neq('status', 'zurückgezogen')
      .or('submission_type.is.null,submission_type.neq.mangel')
      .not('lat', 'is', null)
      .limit(200)
      .then(({ data }) => {
        if (!data) return
        setPins(
          data.filter(d => d.lat != null && d.lng != null).map(d => ({
            id: d.id,
            lng: d.lng as number,
            lat: d.lat as number,
            title: d.title,
            meta: `${d.category ?? ''} · ${STATUS_LABEL[d.status] ?? d.status}`,
            href: `/forderungen/${d.id}`,
          }))
        )
      })
  }, [city.id])

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Karte</h1>
            <p className="mt-0.5 text-sm text-gray-500">Forderungen in {city.name} räumlich entdecken</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <MapView pins={pins} cooperative className="h-[calc(100dvh-11rem)] w-full" />
          </div>
        </div>
      </main>
    </>
  )
}
