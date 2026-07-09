'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2, Wrench, X } from 'lucide-react'
import type { MapPin } from '@/components/MapView'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-56 w-full bg-gray-100 animate-pulse" />,
})

// Triage-Karte für den Admin-Bereich: verortete Mängel der aktuellen
// Listen-Auswahl, farbcodiert nach Bearbeitungsstatus. Pins kommen vom
// Aufrufer (bereits gefiltert), damit Karte und Liste immer dieselbe
// Menge zeigen.
const LEGENDE = [
  { farbe: '#EA580C', label: 'Offen' },
  { farbe: '#16A34A', label: 'Erledigt' },
  { farbe: '#6B7280', label: 'Zurückgestellt' },
]

export default function AdminMaengelKarte({ pins }: { pins: MapPin[] }) {
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [full])

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="px-4 pt-4 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Wrench size={15} className="text-orange-500" />
            Mängel auf der Karte
            <span className="font-normal text-gray-400">· {pins.length} verortet</span>
          </div>
          <div className="flex items-center gap-3">
            {LEGENDE.map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.farbe }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {pins.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-gray-400">
            Keine verorteten Mängel in dieser Auswahl. Neue Mängelmeldungen mit
            Karten-Pin erscheinen hier automatisch.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setFull(true)}
            className="relative block w-full text-left"
            aria-label="Mängel-Karte im Vollbild öffnen"
          >
            <MapView pins={pins} zoom={12} interactive={false} className="h-56 w-full" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
              <Maximize2 size={13} /> Vollbild
            </span>
          </button>
        )}
      </div>

      {full && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Wrench size={15} className="text-orange-500" /> Mängel auf der Karte
              <span className="font-normal text-gray-400">· {pins.length}</span>
            </div>
            <button
              onClick={() => setFull(false)}
              className="p-1.5 -mr-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Vollbild schließen"
            >
              <X size={20} />
            </button>
          </div>
          <MapView pins={pins} zoom={13} geolocate className="w-full h-[calc(100dvh-3.5rem)]" />
        </div>
      )}
    </>
  )
}
