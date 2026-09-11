'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2, X } from 'lucide-react'
import type { MapPin, LngLat } from '@/components/MapView'

// Karte mit Vollbild-Umschaltung: kompakte Ansicht mit Vergrößern-Knopf,
// im Vollbild ein X zurück in die vorherige Ansicht. Im Vollbild bekommt die
// Karte eine feste Höhe (calc), damit sie zuverlässig rendert (kein Blank).
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
})

export default function MapPanel({
  pins,
  center,
  zoom = 13,
  className = 'h-64 w-full',
  title = 'Karte',
}: {
  pins?: MapPin[]
  center?: LngLat
  zoom?: number
  className?: string
  title?: string
}) {
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [full])

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <MapView pins={pins} center={center} zoom={zoom} cooperative className={className} />
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
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            <button onClick={() => setFull(false)} aria-label="Vollbild schließen" className="text-gray-500 transition-colors hover:text-gray-900">
              <X size={22} />
            </button>
          </div>
          <MapView pins={pins} center={center} zoom={zoom} className="h-[calc(100dvh-3.5rem)] w-full" />
        </div>
      )}
    </>
  )
}
