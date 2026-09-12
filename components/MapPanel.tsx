'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2, X } from 'lucide-react'
import type { MapPin, LngLat } from '@/components/MapView'

// Karte mit Vollbild-Umschaltung — für Anzeige- UND Auswahl-Karten (Picker).
// Kompakte Ansicht mit Vergrößern-Knopf (oben links, kollidiert nicht mit den
// Zoom-Controls); im Vollbild ein X zurück in die vorherige Ansicht.
// Picker-Props (value/onChange) werden an BEIDE Instanzen durchgereicht — da
// die Auswahl vom Elternteil kontrolliert wird, bleiben kompakte und
// Vollbild-Karte synchron. Im Vollbild feste Höhe (calc) → kein Blank-Render.
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
})

type Props = {
  pins?: MapPin[]
  center?: LngLat
  zoom?: number
  className?: string
  title?: string
  /** ohne eigenen Rahmen/Rundung (der Eltern-Container liefert den Rahmen) */
  bare?: boolean
  fit?: boolean
  geolocate?: boolean
  // Auswahl-Modus (durchgereicht → synchron zwischen kompakt & Vollbild)
  picker?: boolean
  maxPins?: number
  value?: LngLat[]
  onChange?: (pins: LngLat[]) => void
  onPinClick?: (id: string) => void
}

export default function MapPanel(p: Props) {
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [full])

  const shared = {
    pins: p.pins, center: p.center, zoom: p.zoom, fit: p.fit, geolocate: p.geolocate,
    picker: p.picker, maxPins: p.maxPins, value: p.value, onChange: p.onChange, onPinClick: p.onPinClick,
  }
  const wrap = p.bare ? 'relative' : 'relative overflow-hidden rounded-2xl border border-gray-100 bg-white'

  return (
    <>
      <div className={wrap}>
        <MapView {...shared} cooperative className={p.className ?? 'h-64 w-full'} />
        <button
          onClick={() => setFull(true)}
          aria-label="Karte im Vollbild öffnen"
          className="absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:text-gray-900"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {full && (
        <div className="fixed inset-0 z-[80] bg-white">
          <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
            <span className="text-sm font-semibold text-gray-900">{p.title ?? 'Karte'}</span>
            <button onClick={() => setFull(false)} aria-label="Vollbild schließen" className="text-gray-500 transition-colors hover:text-gray-900">
              <X size={22} />
            </button>
          </div>
          <MapView {...shared} className="h-[calc(100dvh-3.5rem)] w-full" />
        </div>
      )}
    </>
  )
}
