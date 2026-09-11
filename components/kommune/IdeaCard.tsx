'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Lightbulb, MessageSquare } from 'lucide-react'
import type { Idea } from '@/lib/kommune/detail'
import type { ReactionMode } from '@/lib/kommune/demo'

// Bürgerbeitrag/Idee mit dem konfigurierbaren Lybertas-Reaktionsmodell.
// Reaktionen sind in der Demo optimistisch/lokal (nicht persistiert).
export default function IdeaCard({ idea, mode }: { idea: Idea; mode: ReactionMode }) {
  const [picked, setPicked] = useState<null | 'up' | 'gegen' | 'alt'>(null)
  const bump = (base: number, key: 'up' | 'gegen' | 'alt') => base + (picked === key ? 1 : 0)

  const pill = (active: boolean, tone: 'green' | 'orange' | 'blue') => {
    const on = { green: 'bg-green-100 text-green-700 border-green-200', orange: 'bg-orange-100 text-orange-700 border-orange-200', blue: 'bg-blue-100 text-blue-700 border-blue-200' }[tone]
    const off = { green: 'hover:border-green-300 hover:text-green-700', orange: 'hover:border-orange-300 hover:text-orange-700', blue: 'hover:border-blue-300 hover:text-blue-700' }[tone]
    return `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? on : `bg-white text-gray-600 border-gray-200 ${off}`}`
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{idea.category}</span>
        <span className="text-xs text-gray-400">{idea.author}</span>
      </div>
      <h3 className="font-semibold leading-snug text-gray-900">{idea.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{idea.text}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(mode === 'support' || mode === 'sca') && (
          <button onClick={() => setPicked(p => p === 'up' ? null : 'up')} className={pill(picked === 'up', 'green')}>
            <ThumbsUp size={13} /> Unterstützen <span className="tabular-nums opacity-70">{bump(idea.supports, 'up')}</span>
          </button>
        )}
        {mode === 'sca' && (
          <>
            <button onClick={() => setPicked(p => p === 'gegen' ? null : 'gegen')} className={pill(picked === 'gegen', 'orange')}>
              <ThumbsDown size={13} /> Gegenargument <span className="tabular-nums opacity-70">{bump(idea.gegen, 'gegen')}</span>
            </button>
            <button onClick={() => setPicked(p => p === 'alt' ? null : 'alt')} className={pill(picked === 'alt', 'blue')}>
              <Lightbulb size={13} /> Alternative <span className="tabular-nums opacity-70">{bump(idea.alternativen, 'alt')}</span>
            </button>
          </>
        )}
        {mode !== 'none' && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400">
            <MessageSquare size={13} /> {idea.comments} Kommentare
          </span>
        )}
      </div>
    </div>
  )
}
