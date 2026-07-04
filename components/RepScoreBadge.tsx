'use client'

import { useState } from 'react'
import { BarChart2, X } from 'lucide-react'
import { MIN_SCORE_PARTICIPANTS } from '@/lib/repScore'

const EXPLANATION =
  'Der Repräsentativitäts-Score zeigt, wie gut die Beteiligung an dieser Forderung oder Umfrage die Bevölkerungsstruktur von Köln Innenstadt widerspiegelt. Grundlage sind Altersgruppe, Stadtteil und Geschlecht.'

export default function RepScoreBadge({ score, participants }: { score: number; participants: number }) {
  const [open, setOpen] = useState(false)

  const hasAny = participants > 0
  const enough = participants >= MIN_SCORE_PARTICIPANTS
  const color = !enough ? 'text-gray-500' : score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors"
      >
        <BarChart2 size={13} className="text-gray-400" />
        {hasAny ? (
          <span>
            Repräsentativität: <span className={`font-semibold ${color}`}>{score} / 100</span>
            {!enough && <span className="text-gray-400"> · vorläufig</span>}
          </span>
        ) : (
          <span className="text-gray-500">Repräsentativität: noch keine Beteiligung</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={18} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Repräsentativitäts-Score</h2>
            </div>

            {hasAny ? (
              <div className="flex items-end gap-2 mb-4">
                <span className={`text-4xl font-bold ${color}`}>{score}</span>
                <span className="text-gray-400 mb-1">/ 100</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-300 mb-4">Noch nicht verfügbar</div>
            )}

            <p className="text-sm text-gray-600 leading-relaxed mb-4">{EXPLANATION}</p>

            <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
              {hasAny
                ? enough
                  ? `Basierend auf ${participants} Teilnehmenden mit vollständigen Angaben.`
                  : `Erst ${participants} Teilnehmende mit vollständigen Angaben — der Wert ist vorläufig und wird aussagekräftiger, je mehr Menschen sich beteiligen (ab ${MIN_SCORE_PARTICIPANTS}).`
                : 'Sobald sich Menschen mit vollständigen Profilangaben beteiligen, entsteht hier ein Score.'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
