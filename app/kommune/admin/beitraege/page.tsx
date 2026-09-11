'use client'

import { useState } from 'react'
import { MODERATION_QUEUE, type QueueItem } from '@/lib/kommune/admin'
import { Check, EyeOff, ShieldCheck, Filter } from 'lucide-react'

const POS: Record<QueueItem['position'], { label: string; badge: string }> = {
  unterstuetzung: { label: 'Unterstützung', badge: 'bg-green-100 text-green-700' },
  gegenargument: { label: 'Gegenargument', badge: 'bg-orange-100 text-orange-700' },
  alternative: { label: 'Alternative', badge: 'bg-blue-100 text-blue-700' },
  kommentar: { label: 'Kommentar', badge: 'bg-gray-100 text-gray-600' },
}

export default function AdminBeitraege() {
  const [items, setItems] = useState<QueueItem[]>(MODERATION_QUEUE)
  const [filter, setFilter] = useState<'offen' | 'alle'>('offen')
  const [answering, setAnswering] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')

  const setStatus = (id: string, status: QueueItem['status']) => setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  const visible = items.filter(i => filter === 'alle' || i.status === 'offen')

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beiträge & Moderation</h1>
          <p className="mt-0.5 text-sm text-gray-500">Bürgerbeiträge prüfen, freigeben, beantworten.</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 text-sm">
          {(['offen', 'alle'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {f === 'offen' ? 'Offen' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center text-sm text-gray-500">
          <Filter size={20} className="mx-auto mb-2 text-gray-300" /> Keine offenen Beiträge — alles moderiert.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(i => {
            const pos = POS[i.position]
            return (
              <div key={i.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pos.badge}`}>{pos.label}</span>
                  <span className="text-xs text-gray-400">{i.process} · {i.author} · {new Date(i.date).toLocaleDateString('de-DE')}</span>
                  {i.status !== 'offen' && <span className="ml-auto text-xs font-medium text-gray-400">{i.status === 'freigegeben' ? 'Freigegeben' : 'Versteckt'}</span>}
                </div>
                <p className="mt-2 text-sm text-gray-800">{i.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => setStatus(i.id, 'freigegeben')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors"><Check size={13} /> Freigeben</button>
                  <button onClick={() => setStatus(i.id, 'versteckt')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"><EyeOff size={13} /> Verstecken</button>
                  <button onClick={() => { setAnswering(a => a === i.id ? null : i.id); setAnswer('') }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"><ShieldCheck size={13} /> Offiziell antworten</button>
                </div>
                {answering === i.id && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={2} placeholder="Offizielle Antwort der Verwaltung…" className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setAnswering(null)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Als offizielle Antwort veröffentlichen</button>
                      <span className="text-xs text-gray-400">erscheint mit dem Kennzeichen „Stadt Musterstadt“</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
