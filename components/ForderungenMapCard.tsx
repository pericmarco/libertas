'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Maximize2, X } from 'lucide-react'
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
  const [full, setFull] = useState(false)
  const usingDemo = pins.length === 0
  const shown = usingDemo ? DEMO_PINS : pins

  // Body-Scroll sperren, solange das Vollbild offen ist.
  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [full])

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <MapPin size={15} className="text-gray-400" /> Forderungen auf der Karte
          </div>
          {usingDemo && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Beispiel</span>
          )}
        </div>

        {/* Kompakte Vorschau (nicht interaktiv → fängt kein Seiten-Scrollen ab), Klick öffnet Vollbild */}
        <button
          type="button"
          onClick={() => setFull(true)}
          className="relative block w-full text-left"
          aria-label="Karte im Vollbild öffnen"
        >
          <MapView pins={shown} zoom={12} interactive={false} className="h-56 w-full" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            <Maximize2 size={13} /> Vollbild
          </span>
        </button>

        {usingDemo && (
          <p className="px-4 py-2.5 text-xs text-gray-400">
            Beispielhafte Pins — sobald Forderungen mit Ort eingereicht werden, erscheinen sie hier automatisch.
          </p>
        )}
      </div>

      {/* Vollbild-Kartenmodus */}
      {full && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <MapPin size={15} className="text-gray-400" /> Forderungen auf der Karte
              {usingDemo && (
                <span className="ml-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Beispiel</span>
              )}
            </div>
            <button
              onClick={() => setFull(false)}
              className="p-1.5 -mr-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Vollbild schließen"
            >
              <X size={20} />
            </button>
          </div>
          <MapView pins={shown} zoom={13} className="w-full h-[calc(100dvh-3.5rem)]" />
        </div>
      )}
    </>
  )
}
