'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart } from 'lucide-react'
import type { CouncilSeatDistribution } from '@/lib/councilSeats'

const R = 80
const CX = 110
const CY = 110
const CIRC = 2 * Math.PI * R
const GAP = 2.2 // kleine Luecke zwischen Segmenten (in Pfad-Einheiten)

export default function CouncilSeatDistributionChart({
  title,
  subtitle,
  totalSeats,
  sourceNote,
  segments,
}: CouncilSeatDistribution) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = segments.find(s => s.id === selectedId) ?? null
  const pct = (seats: number) => Math.round((seats / totalSeats) * 100)

  // Kumulative Offsets fuer die Ring-Segmente vorberechnen (ohne Mutation).
  const arcs = segments.map((seg, i) => {
    const seatsBefore = segments.slice(0, i).reduce((sum, s) => sum + s.seats, 0)
    return {
      seg,
      len: (seg.seats / totalSeats) * CIRC,
      offset: (seatsBefore / totalSeats) * CIRC,
    }
  })

  function toggle(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChart size={16} className="text-gray-400" />
            {title}
          </CardTitle>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-6">
          {/* Ringdiagramm */}
          <div className="relative mx-auto shrink-0">
            <svg
              width={200}
              height={200}
              viewBox="0 0 220 220"
              role="img"
              aria-label={`Sitzverteilung als Ringdiagramm, ${totalSeats} Sitze insgesamt`}
            >
              <g transform={`rotate(-90 ${CX} ${CY})`}>
                {arcs.map(({ seg, len, offset }) => {
                  const active = selectedId === seg.id
                  const vis = Math.max(len - GAP, 0.5)
                  return (
                    <circle
                      key={seg.id}
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={active ? 36 : 30}
                      strokeDasharray={`${vis} ${CIRC - vis}`}
                      strokeDashoffset={-offset}
                      className="cursor-pointer transition-all duration-200"
                      style={{ opacity: selectedId && !active ? 0.32 : 1 }}
                      onClick={() => toggle(seg.id)}
                      aria-hidden="true"
                    />
                  )
                })}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
              {selected ? (
                <>
                  <span className="text-3xl font-bold text-gray-900 tabular-nums leading-none">{selected.seats}</span>
                  <span className="text-xs font-semibold text-gray-900 mt-1 leading-tight">{selected.name}</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-900 tabular-nums leading-none">{totalSeats}</span>
                  <span className="text-xs text-gray-500 mt-1">Sitze</span>
                </>
              )}
            </div>
          </div>

          {/* Legende (per Tastatur bedienbar) */}
          <ul className="flex-1 min-w-[220px] flex flex-col gap-0.5" role="list">
            {segments.map(seg => {
              const active = selectedId === seg.id
              return (
                <li key={seg.id}>
                  <button
                    type="button"
                    onClick={() => toggle(seg.id)}
                    aria-pressed={active}
                    aria-label={
                      seg.children
                        ? `Weitere Akteure, ${seg.seats} von ${totalSeats} Sitzen, klicken für Aufschlüsselung`
                        : `${seg.name}, ${seg.seats} von ${totalSeats} Sitzen`
                    }
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-[3px] shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">{seg.name}</span>
                    <span className="text-sm text-gray-500 tabular-nums shrink-0">
                      <span className="font-semibold text-gray-900">{seg.seats}</span> · {pct(seg.seats)}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>

        {/* Detailpanel — klappt inline auf */}
        {selected && (
          <div className="border-t border-gray-100 px-4 py-4 mt-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded shrink-0" style={{ backgroundColor: selected.color }} />
              <div>
                <div className="font-semibold text-gray-900">
                  {selected.children ? 'Weitere Akteure' : selected.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selected.children ? `${selected.seats} von ${totalSeats} Sitzen` : selected.status}
                </div>
              </div>
            </div>

            {selected.children ? (
              <>
                <p className="text-xs text-gray-500 mt-3 mb-1">
                  Kleinere Fraktionen, Ratsgruppen und Einzelmandate — zusammengefasst.
                </p>
                <ul className="mt-1">
                  {selected.children.map(child => (
                    <li
                      key={child.id}
                      className="flex items-baseline justify-between gap-3 py-2.5 border-t border-gray-100 first:border-t-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{child.name}</div>
                        <div className="text-xs text-gray-500">{child.status}</div>
                      </div>
                      <div className="text-sm text-gray-500 tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{child.seats}</span> {child.seats === 1 ? 'Sitz' : 'Sitze'}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div className="flex gap-6 mt-3">
                  <div>
                    <div className="text-xl font-bold text-gray-900 tabular-nums">{selected.seats}</div>
                    <div className="text-xs text-gray-500">Sitze</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 tabular-nums">{pct(selected.seats)}%</div>
                    <div className="text-xs text-gray-500">Anteil</div>
                  </div>
                </div>
                {selected.email && (
                  <div className="text-sm text-gray-600 mt-3">
                    Kontakt:{' '}
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">
                      {selected.email}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>

      <p className="text-xs text-gray-400 -mt-4 mb-6 px-1">{sourceNote}</p>
    </>
  )
}
