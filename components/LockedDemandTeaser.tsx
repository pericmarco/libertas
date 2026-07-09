'use client'

import { Lock } from 'lucide-react'
import { RELEVANCE_THRESHOLD } from '@/components/DemandCard'

// Gesperrte Vorschau-Karte für nicht angemeldete Besucher: Titel und
// Relevanzpunkte sind sichtbar, der Rest ist bewusst ausgegraut. Ein Klick
// führt zur Anmeldung — echte Sperre, nicht nur optisch: die vollständigen
// Inhalte liegen hinter der Login-only-Detailseite.
export default function LockedDemandTeaser({
  title,
  relevanceScore,
  onClick,
}: {
  title: string
  relevanceScore: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-blue-200 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-500 truncate group-hover:text-gray-700 transition-colors">{title}</div>
        <div className="text-xs text-gray-400 mt-1">
          {relevanceScore} / {RELEVANCE_THRESHOLD} Relevanzpunkte
        </div>
      </div>
      <span className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
        <Lock size={13} />
        Anmelden
      </span>
    </button>
  )
}
