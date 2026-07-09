'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Vote, ChevronLeft, ChevronRight } from 'lucide-react'

type Election = {
  id: string
  title: string
  election_date: string | null
  expected_year: number | null
  description: string | null
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function dateLabel(e: Election): string {
  if (e.election_date) {
    return new Date(e.election_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return `voraussichtlich ${e.expected_year}`
}

// Eine Wahl im Startseiten-Stil: Satz + große Tage-Kachel + Infotext.
function ElectionSlide({ e }: { e: Election }) {
  const days = e.election_date ? daysUntil(e.election_date) : null

  return (
    <div className="px-6 py-6">
      <p className="text-gray-600 leading-relaxed">
        {days === null ? (
          <>
            <strong className="font-semibold text-gray-900">{e.title}</strong> — {dateLabel(e)}.
          </>
        ) : days === 0 ? (
          <>
            Heute ist die <strong className="font-semibold text-gray-900">{e.title}</strong> ({dateLabel(e)}).
          </>
        ) : (
          <>
            Noch <span className="font-bold text-blue-600">{days}</span> {days === 1 ? 'Tag' : 'Tage'} bis zur{' '}
            <strong className="font-semibold text-gray-900">{e.title}</strong> ({dateLabel(e)}).
          </>
        )}
      </p>

      <div className="mt-4">
        <div className="inline-flex min-w-[104px] flex-col items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-white">
          {days === null ? (
            <>
              <span className="text-3xl font-bold leading-none tabular-nums">{e.expected_year}</span>
              <span className="mt-1 text-xs font-medium">geplant</span>
            </>
          ) : days === 0 ? (
            <span className="text-2xl font-bold leading-none">Heute</span>
          ) : (
            <>
              <span className="text-3xl font-bold leading-none tabular-nums">{days}</span>
              <span className="mt-1 text-xs font-medium">{days === 1 ? 'Tag' : 'Tage'}</span>
            </>
          )}
        </div>
      </div>

      {e.description && (
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">{e.description}</p>
      )}
    </div>
  )
}

export default function ElectionsCard({ elections }: { elections: Election[] }) {
  // Vergangene Wahlen mit festem Termin ausblenden, dann chronologisch sortieren:
  // feste Termine zuerst (nach Datum), danach „voraussichtlich" nach Jahr.
  const upcoming = elections
    .filter(e => !e.election_date || daysUntil(e.election_date) >= 0)
    .sort((a, b) => {
      const ka = a.election_date ? new Date(a.election_date).getTime() : (a.expected_year ? new Date(a.expected_year, 0, 1).getTime() : Infinity)
      const kb = b.election_date ? new Date(b.election_date).getTime() : (b.expected_year ? new Date(b.expected_year, 0, 1).getTime() : Infinity)
      return ka - kb
    })

  const n = upcoming.length
  const loop = n > 1
  // Für den nahtlosen Ringlauf die letzte Folie vorn und die erste hinten klonen.
  const slides = loop ? [upcoming[n - 1], ...upcoming, upcoming[0]] : upcoming

  const [index, setIndex] = useState(loop ? 1 : 0)
  const [anim, setAnim] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)

  if (n === 0) return null

  const realIndex = loop ? (index - 1 + n) % n : index

  function move(delta: number) {
    if (!loop) return
    setAnim(true)
    setIndex(i => i + delta)
  }
  function goTo(real: number) {
    setAnim(true)
    setIndex(loop ? real + 1 : real)
  }
  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (!loop || e.target !== e.currentTarget || e.propertyName !== 'transform') return
    if (index === 0) { setAnim(false); setIndex(n) }
    else if (index === n + 1) { setAnim(false); setIndex(1) }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Vote size={16} className="text-gray-400" />
          Anstehende Wahlen
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 relative overflow-hidden">
        <div
          className="flex"
          style={{ transform: `translateX(-${index * 100}%)`, transition: anim ? 'transform .35s ease' : 'none' }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={e => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - startX.current
            const dy = e.changedTouches[0].clientY - startY.current
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1)
          }}
        >
          {slides.map((e, i) => (
            <div key={i} className="w-full shrink-0">
              <ElectionSlide e={e} />
            </div>
          ))}
        </div>

        {loop && (
          <>
            <button
              onClick={() => move(-1)}
              aria-label="Vorherige Wahl"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => move(1)}
              aria-label="Nächste Wahl"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </CardContent>

      {loop && (
        <div className="flex justify-center gap-1.5 pb-4">
          {upcoming.map((e, i) => (
            <button
              key={e.id}
              onClick={() => goTo(i)}
              aria-label={`Zu Wahl ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === realIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
