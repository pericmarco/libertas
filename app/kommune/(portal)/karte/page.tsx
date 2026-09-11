'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Building2, Lightbulb, Wrench, BarChart3 } from 'lucide-react'
import type { LngLat, MapPin } from '@/components/MapView'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
})

const CENTER: LngLat = { lng: 6.83, lat: 51.10 }

type Layer = 'vorhaben' | 'ideen' | 'maengel' | 'umfragen'
const LAYERS: { key: Layer; label: string; icon: typeof Building2; color: string }[] = [
  { key: 'vorhaben', label: 'Vorhaben', icon: Building2, color: '#2563EB' },
  { key: 'ideen', label: 'Ideen', icon: Lightbulb, color: '#059669' },
  { key: 'maengel', label: 'Mängel', icon: Wrench, color: '#EA580C' },
  { key: 'umfragen', label: 'Umfragen', icon: BarChart3, color: '#7C3AED' },
]

type DemoPin = MapPin & { layer: Layer }
const PINS: DemoPin[] = [
  { id: 'v1', layer: 'vorhaben', lng: 6.831, lat: 51.101, title: 'Umbau Bahnhofsvorplatz', meta: 'Vorhaben · Planung', color: '#2563EB', href: '/vorhaben' },
  { id: 'v2', layer: 'vorhaben', lng: 6.826, lat: 51.098, title: 'Neugestaltung Marktplatz', meta: 'Vorhaben · Beteiligung läuft', color: '#2563EB', href: '/beteiligungen/marktplatz' },
  { id: 'id1', layer: 'ideen', lng: 6.834, lat: 51.103, title: 'Mehr schattenspendende Bäume', meta: 'Idee · 214 Unterstützungen', color: '#059669', href: '/beteiligungen/marktplatz' },
  { id: 'id2', layer: 'ideen', lng: 6.828, lat: 51.096, title: 'Überdachte Fahrradstellplätze', meta: 'Idee · 98 Unterstützungen', color: '#059669', href: '/beteiligungen/bahnhofsvorplatz' },
  { id: 'm1', layer: 'maengel', lng: 6.837, lat: 51.099, title: 'Schlagloch Hauptstraße', meta: 'Mangel · Neu', color: '#EA580C' },
  { id: 'm2', layer: 'maengel', lng: 6.822, lat: 51.102, title: 'Defekte Straßenlaterne', meta: 'Mangel · Zugewiesen', color: '#EA580C' },
  { id: 'u1', layer: 'umfragen', lng: 6.830, lat: 51.105, title: 'Mobilitätskonzept 2035', meta: 'Umfrage · 821 Teilnehmende', color: '#7C3AED', href: '/beteiligungen/mobilitaet-2035' },
]

export default function KommuneKarte() {
  const [active, setActive] = useState<Record<Layer, boolean>>({ vorhaben: true, ideen: true, maengel: true, umfragen: true })
  const pins = useMemo(() => PINS.filter(p => active[p.layer]), [active])

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Beteiligungskarte</h1>
        <p className="mt-0.5 text-sm text-gray-500">Vorhaben, Ideen, Umfragen und Mängel im Stadtgebiet.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {LAYERS.map(l => {
          const on = active[l.key]
          return (
            <button key={l.key} onClick={() => setActive(a => ({ ...a, [l.key]: !a[l.key] }))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? 'border-transparent text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
              style={on ? { backgroundColor: l.color } : undefined}>
              <l.icon size={14} /> {l.label}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <MapView pins={pins} cooperative center={CENTER} zoom={14} className="h-[58vh] min-h-[340px] w-full" />
      </div>
    </main>
  )
}
