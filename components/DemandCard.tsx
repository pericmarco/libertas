'use client'

import { ThumbsUp, MessageSquare, ChevronRight } from 'lucide-react'

export const RELEVANCE_THRESHOLD = 50

export type Demand = {
  id: string
  title: string
  description: string | null
  category: string
  tags: string[] | null
  relevance_score: number
  status: string
}

const statusColors: Record<string, string> = {
  eingereicht: 'bg-gray-100 text-gray-500',
  geprüft:     'bg-yellow-100 text-yellow-700',
  bearbeitet:  'bg-blue-100 text-blue-700',
  umgesetzt:   'bg-green-100 text-green-700',
  abgelehnt:   'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  eingereicht: 'Eingereicht',
  geprüft:     'Geprüft',
  bearbeitet:  'In Bearbeitung',
  umgesetzt:   'Umgesetzt',
  abgelehnt:   'Abgelehnt',
}

const POSITION_LABEL: Record<string, string> = {
  gegenargument: 'Gegenargument',
  alternative:   'Alternative',
}

type Props = {
  demand: Demand
  areas: string[]
  position?: string
  textCount: number
  /** 'row' = feste Breite für horizontale Reihen, 'list' = volle Breite */
  variant?: 'row' | 'list'
  onOpen: (id: string) => void
  onToggleSupport: (e: React.MouseEvent, id: string) => void
}

export default function DemandCard({
  demand: d,
  areas,
  position,
  textCount,
  variant = 'list',
  onOpen,
  onToggleSupport,
}: Props) {
  const isSupporting = position === 'unterstützend'
  const otherPosition = position === 'gegenargument' || position === 'alternative'
  const progress = Math.min((d.relevance_score / RELEVANCE_THRESHOLD) * 100, 100)
  const snippet = d.description
    ? d.description.length > 100 ? d.description.slice(0, 100) + '…' : d.description
    : null

  return (
    <div
      onClick={() => onOpen(d.id)}
      className={`flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer p-5 ${
        variant === 'row' ? 'w-[270px] shrink-0 snap-start' : 'w-full'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {areas.slice(0, 2).map(a => (
            <span key={a} className="text-xs font-medium text-gray-500">{a}</span>
          ))}
          {areas.length > 2 && (
            <span className="text-xs text-gray-400">+{areas.length - 2}</span>
          )}
          <span className="text-gray-200 text-xs">·</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {statusLabels[d.status] ?? d.status}
          </span>
        </div>

        <div className="font-semibold text-gray-900 leading-snug mb-1.5">{d.title}</div>

        {snippet && <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{snippet}</p>}
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>{d.relevance_score} / {RELEVANCE_THRESHOLD} Relevanzpunkte</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {otherPosition ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 truncate">
                Deine Position: {POSITION_LABEL[position!]}
              </span>
            ) : (
              <button
                onClick={(e) => onToggleSupport(e, d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isSupporting ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ThumbsUp size={13} className={isSupporting ? 'fill-white' : ''} />
                {isSupporting ? 'Unterstützt' : 'Unterstützen'}
              </button>
            )}

            {textCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <MessageSquare size={13} />
                {textCount} {textCount === 1 ? 'Beitrag' : 'Beiträge'}
              </span>
            )}
          </div>

          <ChevronRight size={15} className="text-gray-300 shrink-0" />
        </div>
      </div>
    </div>
  )
}
