'use client'

import { useState, useRef } from 'react'
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

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Leichter Glanz-/Reflection-Verlauf wie bei den Forderungs-Karten.
const GLASS_BG = {
  backgroundImage:
    'radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.95), rgba(255,255,255,0) 45%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
}

// Eine Wahl als zentrierte Premium-Karte mit mittiger, immer gleicher Zahl-Kachel.
function ElectionSlide({ e }: { e: Election }) {
  const days = e.election_date ? daysUntil(e.election_date) : null
  let value: string | number
  let label: string | null
  if (days === null) { value = e.expected_year ?? '–'; label = 'geplant' }
  else if (days === 0) { value = 'Heute'; label = null }
  else { value = days; label = days === 1 ? 'Tag' : 'Tage' }

  return (
    <div
      style={GLASS_BG}
      className="flex w-full max-w-md flex-col items-center rounded-3xl border border-gray-100 px-6 py-8 text-center shadow-[0_10px_30px_-14px_rgba(15,23,42,0.2)]"
    >
      <div className="text-base font-semibold leading-snug text-gray-900">{e.title}</div>
      <div className="mt-1 min-h-[1.1rem] text-xs text-gray-500">
        {e.election_date ? fullDate(e.election_date) : ''}
      </div>

      <div className="mt-6 flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
        <span className={`font-bold leading-none tabular-nums ${value === 'Heute' ? 'text-2xl' : 'text-4xl'}`}>{value}</span>
        {label && <span className="mt-1.5 text-xs font-medium">{label}</span>}
      </div>

      <div className="mt-6 min-h-[2.5rem] max-w-xs text-sm leading-relaxed text-gray-500 line-clamp-2">
        {e.description}
      </div>
    </div>
  )
}

export default function ElectionsCard({ elections }: { elections: Election[] }) {
  const upcoming = elections
    .filter(e => !e.election_date || daysUntil(e.election_date) >= 0)
    .sort((a, b) => {
      const ka = a.election_date ? new Date(a.election_date).getTime() : (a.expected_year ? new Date(a.expected_year, 0, 1).getTime() : Infinity)
      const kb = b.election_date ? new Date(b.election_date).getTime() : (b.expected_year ? new Date(b.expected_year, 0, 1).getTime() : Infinity)
      return ka - kb
    })

  const n = upcoming.length
  const loop = n > 1
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
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Vote size={16} className="text-gray-400" />
        <h2 className="text-base font-semibold text-gray-900">Anstehende Wahlen</h2>
      </div>

      <div className="relative overflow-hidden">
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
            <div key={i} className="flex w-full shrink-0 justify-center px-2 py-2">
              <ElectionSlide e={e} />
            </div>
          ))}
        </div>

        {loop && (
          <>
            <button
              onClick={() => move(-1)}
              aria-label="Vorherige Wahl"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => move(1)}
              aria-label="Nächste Wahl"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {loop && (
        <div className="mt-3 flex justify-center gap-1.5">
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
    </section>
  )
}
