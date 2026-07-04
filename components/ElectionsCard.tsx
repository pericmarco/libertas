'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Vote, ChevronDown } from 'lucide-react'

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

export default function ElectionsCard({ elections }: { elections: Election[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  // Vergangene Wahlen mit festem Termin ausblenden, dann chronologisch sortieren:
  // feste Termine zuerst (nach Datum), danach „voraussichtlich" nach Jahr.
  const upcoming = elections
    .filter(e => !e.election_date || daysUntil(e.election_date) >= 0)
    .sort((a, b) => {
      const ka = a.election_date ? new Date(a.election_date).getTime() : (a.expected_year ? new Date(a.expected_year, 0, 1).getTime() : Infinity)
      const kb = b.election_date ? new Date(b.election_date).getTime() : (b.expected_year ? new Date(b.expected_year, 0, 1).getTime() : Infinity)
      return ka - kb
    })

  if (upcoming.length === 0) return null

  const [next, ...rest] = upcoming
  const nextDays = next.election_date ? daysUntil(next.election_date) : null

  function dateLabel(e: Election) {
    if (e.election_date) {
      return new Date(e.election_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    return `voraussichtlich ${e.expected_year}`
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Vote size={16} className="text-gray-400" />
          Anstehende Wahlen
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Nächste Wahl prominent */}
        <button
          onClick={() => setOpenId(openId === next.id ? null : next.id)}
          className="w-full text-left px-6 py-4 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold text-gray-900">{next.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">{dateLabel(next)}</div>
            </div>
            <div className="text-right shrink-0">
              {nextDays !== null ? (
                <div className="inline-flex flex-col items-center bg-blue-50 text-blue-700 rounded-xl px-3 py-1.5">
                  <span className="text-lg font-bold leading-none">{nextDays === 0 ? 'Heute' : nextDays}</span>
                  {nextDays > 0 && <span className="text-[10px] font-medium">{nextDays === 1 ? 'Tag' : 'Tage'}</span>}
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-400 bg-gray-50 rounded-full px-2.5 py-1">voraussichtlich</span>
              )}
            </div>
          </div>
          {nextDays !== null && nextDays > 0 && (
            <div className="text-xs text-blue-600 font-medium mt-2">Noch {nextDays} {nextDays === 1 ? 'Tag' : 'Tage'} bis zur {next.title}</div>
          )}
          {openId === next.id && next.description && (
            <p className="text-sm text-gray-500 leading-relaxed mt-3">{next.description}</p>
          )}
        </button>

        {/* Weitere Wahlen */}
        {rest.map(e => (
          <button
            key={e.id}
            onClick={() => setOpenId(openId === e.id ? null : e.id)}
            className="w-full text-left px-6 py-3.5 border-b last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium text-gray-800 text-sm">{e.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{dateLabel(e)}</div>
              </div>
              <ChevronDown size={15} className={`text-gray-300 shrink-0 transition-transform ${openId === e.id ? 'rotate-180' : ''}`} />
            </div>
            {openId === e.id && e.description && (
              <p className="text-sm text-gray-500 leading-relaxed mt-2">{e.description}</p>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
