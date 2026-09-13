'use client'

import { useMemo, useRef, useState } from 'react'
import { MessageCircleQuestion, ThumbsUp, Check, Plus, BadgeCheck, Clock } from 'lucide-react'
import { FRAGEN, type QA } from '@/lib/kommune/fragen'

export default function FragenTab({ slug }: { slug: string }) {
  const [items, setItems] = useState<QA[]>(FRAGEN[slug] ?? [])
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const nextId = useRef(1)

  const sorted = useMemo(() => {
    // Beantwortete zuerst, dann nach Zustimmung.
    return [...items].sort((a, b) => {
      const ans = Number(!!b.answer) - Number(!!a.answer)
      if (ans !== 0) return ans
      return (b.upvotes + (voted.has(b.id) ? 1 : 0)) - (a.upvotes + (voted.has(a.id) ? 1 : 0))
    })
  }, [items, voted])

  function vote(id: string) {
    setVoted(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }
  function ask() {
    if (q.trim().length < 8) return
    setItems(prev => [{ id: 'neu-' + nextId.current++, question: q.trim(), author: 'Sie (Demo)', date: '', upvotes: 0 }, ...prev])
    setQ(''); setOpen(false)
  }

  const offen = items.filter(i => !i.answer).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {items.length} Fragen · {items.length - offen} beantwortet
        </p>
        <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <Plus size={16} /> Frage stellen
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Ihre Frage an die Verwaltung</label>
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={3} placeholder="Was möchten Sie zum Verfahren wissen?"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div className="mt-2 flex items-center gap-3">
            <button onClick={ask} disabled={q.trim().length < 8}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
              Absenden
            </button>
            <span className="text-xs text-gray-400">Demo · die Verwaltung antwortet i. d. R. innerhalb weniger Tage</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map(item => {
          const isVoted = voted.has(item.id)
          const count = item.upvotes + (isVoted ? 1 : 0)
          return (
            <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MessageCircleQuestion size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-gray-900">{item.question}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.author}</span>
                    {item.answer
                      ? <span className="inline-flex items-center gap-1 font-medium text-green-600"><BadgeCheck size={13} /> beantwortet</span>
                      : <span className="inline-flex items-center gap-1 font-medium text-amber-600"><Clock size={13} /> in Bearbeitung</span>}
                  </div>
                </div>
                <button onClick={() => vote(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${isVoted ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700'}`}>
                  {isVoted ? <Check size={14} /> : <ThumbsUp size={14} />} <span className="tabular-nums">{count}</span>
                </button>
              </div>

              {item.answer && (
                <div className="mt-3 rounded-xl border border-green-100 bg-green-50/50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <BadgeCheck size={14} /> Antwort der Verwaltung · {item.answer.by}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{item.answer.text}</p>
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Noch keine Fragen – stellen Sie die erste.
          </p>
        )}
      </div>
    </div>
  )
}
