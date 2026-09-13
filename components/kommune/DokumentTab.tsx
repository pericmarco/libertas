'use client'

import { useRef, useState } from 'react'
import { FileText, MessageSquare, ChevronDown, Download, Send } from 'lucide-react'
import { DOCUMENTS, type DocComment } from '@/lib/kommune/documents'

export default function DokumentTab({ slug }: { slug: string }) {
  const doc = DOCUMENTS[slug]
  const [open, setOpen] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, DocComment[]>>(() =>
    doc ? Object.fromEntries(doc.sections.map(s => [s.id, s.comments])) : {},
  )
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const nextId = useRef(1)

  if (!doc) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
        Für dieses Verfahren ist noch kein Dokument hinterlegt.
      </div>
    )
  }

  function submit(sid: string) {
    const text = (drafts[sid] ?? '').trim()
    if (text.length < 3) return
    const c: DocComment = { id: 'neu-' + nextId.current++, author: 'Sie (Demo)', date: '', text }
    setComments(prev => ({ ...prev, [sid]: [...(prev[sid] ?? []), c] }))
    setDrafts(prev => ({ ...prev, [sid]: '' }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Dokumente */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Dokumente</h2>
        <div className="mt-3 flex flex-col gap-2">
          {doc.files.map(f => (
            <div key={f.title} className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><FileText size={17} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">{f.title}</div>
                <div className="text-xs text-gray-400">{f.kind} · {f.pages} Seiten · {f.size}</div>
              </div>
              <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600">
                <Download size={13} /> Ansehen
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-600">{doc.intro}</p>

      {/* Abschnitte mit Kommentaren */}
      <div className="flex flex-col gap-3">
        {doc.sections.map(s => {
          const list = comments[s.id] ?? []
          const isOpen = open === s.id
          return (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-gray-50/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">{s.nr}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">{s.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{s.summary}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-gray-400">
                  <MessageSquare size={13} /> {list.length}
                </span>
                <ChevronDown size={17} className={`shrink-0 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/40 p-5">
                  {list.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {list.map(c => (
                        <div key={c.id} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{c.author}</span>
                            <span>{c.date ? new Date(c.date + 'T00:00:00').toLocaleDateString('de-DE') : 'gerade eben'}</span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-gray-700">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Noch keine Anmerkung zu diesem Abschnitt – seien Sie die erste Person.</p>
                  )}

                  <div className="mt-3 flex items-end gap-2">
                    <textarea
                      value={drafts[s.id] ?? ''}
                      onChange={e => setDrafts(prev => ({ ...prev, [s.id]: e.target.value }))}
                      rows={2}
                      placeholder="Anmerkung zu diesem Abschnitt…"
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => submit(s.id)}
                      disabled={(drafts[s.id] ?? '').trim().length < 3}
                      aria-label="Anmerkung senden"
                      className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Demo · Anmerkungen werden nicht gespeichert.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
