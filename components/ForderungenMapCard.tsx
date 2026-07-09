'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { MapPin as Pin } from '@/components/MapView'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-56 w-full bg-gray-100 animate-pulse" />,
})

// Beispiel-Pins in Köln Innenstadt — werden nur gezeigt, solange es noch keine
// echten verorteten Forderungen gibt. Danach erscheinen automatisch die echten.
const DEMO_PINS: Pin[] = [
  { lng: 6.9483, lat: 50.9365, title: 'Mehr Sicherheit am Neumarkt', meta: 'Sicherheit & Ordnung · Eingereicht' },
  { lng: 6.9430, lat: 50.9268, title: 'Mehr Fahrradständer am Barbarossaplatz', meta: 'Verkehr & Mobilität · In Bearbeitung' },
  { lng: 6.9560, lat: 50.9490, title: 'Bessere Beleuchtung am Ebertplatz', meta: 'Sicherheit & Ordnung · Geprüft' },
  { lng: 6.9440, lat: 50.9472, title: 'Vermüllung am MediaPark reduzieren', meta: 'Umwelt & Sauberkeit · Eingereicht' },
]

export default function ForderungenMapCard({ pins }: { pins: Pin[] }) {
  const usingDemo = pins.length === 0
  const shown = usingDemo ? DEMO_PINS : pins

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <MapPin size={15} className="text-gray-400" /> Forderungen auf der Karte
        </div>
        {usingDemo && (
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Beispiel</span>
        )}
      </div>
      <MapView pins={shown} zoom={12} className="h-56 w-full" />
      {usingDemo && (
        <p className="px-4 py-2.5 text-xs text-gray-400">
          Beispielhafte Pins — sobald Forderungen mit Ort eingereicht werden, erscheinen sie hier automatisch.
        </p>
      )}
    </div>
  )
}
