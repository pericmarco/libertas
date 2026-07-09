'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CouncilSeatDistributionChart from '@/components/CouncilSeatDistributionChart'
import { COLOGNE_COUNCIL } from '@/lib/councilSeats'
import { BV_INNENSTADT } from '@/lib/stadtteilDaten'

// „Politische Vertretung": Rat der Stadt Köln und Bezirksvertretung
// Innenstadt als wischbare Karten (gleiches Swipe-Muster wie die
// Wahlen-Karte), „Alle anzeigen" stapelt beide untereinander.
const CHARTS = [COLOGNE_COUNCIL, BV_INNENSTADT]

export default function PolitischeVertretung() {
  const [index, setIndex] = useState(0)
  const [alle, setAlle] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)

  function move(delta: number) {
    setIndex(i => Math.min(Math.max(i + delta, 0), CHARTS.length - 1))
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Politische Vertretung</h2>
        <button
          type="button"
          onClick={() => setAlle(a => !a)}
          aria-expanded={alle}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {alle ? 'Weniger anzeigen' : 'Alle anzeigen'}
        </button>
      </div>

      {alle ? (
        <div>
          {CHARTS.map(c => <CouncilSeatDistributionChart key={c.cityId} {...c} />)}
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex"
              style={{ transform: `translateX(-${index * 100}%)`, transition: 'transform .35s ease' }}
              onTouchStart={e => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY }}
              onTouchEnd={e => {
                const dx = e.changedTouches[0].clientX - startX.current
                const dy = e.changedTouches[0].clientY - startY.current
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1)
              }}
            >
              {CHARTS.map(c => (
                <div key={c.cityId} className="w-full shrink-0 min-w-0">
                  <CouncilSeatDistributionChart {...c} />
                </div>
              ))}
            </div>
          </div>

          {index > 0 && (
            <button
              onClick={() => move(-1)}
              aria-label="Vorherige Ansicht"
              className="hidden sm:flex absolute left-2 top-24 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {index < CHARTS.length - 1 && (
            <button
              onClick={() => move(1)}
              aria-label="Nächste Ansicht"
              className="hidden sm:flex absolute right-2 top-24 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <div className="flex justify-center gap-1.5 -mt-2">
            {CHARTS.map((c, i) => (
              <button
                key={c.cityId}
                onClick={() => setIndex(i)}
                aria-label={c.title}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
