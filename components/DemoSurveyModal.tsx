'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { ShieldCheck, CheckCircle2, Circle, X } from 'lucide-react'
import type { DemoSurvey } from '@/lib/demoBeispiel'

// Klickbare Beispiel-Umfrage im Design der echten Stadtumfragen. Man kann
// „abstimmen" — es wird aber nichts gespeichert (rein Demo, klar markiert).
export default function DemoSurveyModal({ survey, onClose }: { survey: DemoSurvey | null; onClose: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    if (!survey) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [survey])

  if (!survey) return null
  const sender = survey.sender ?? 'Lybertas Beispielpartei'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
              <ShieldCheck size={12} /> Stadtumfrage · {sender}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Beispiel</span>
              <button onClick={onClose} aria-label="Schließen" className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
          </div>

          <h3 className="mt-2 text-lg font-semibold leading-snug text-gray-900">{survey.q}</h3>

          {!voted ? (
            <div className="mt-5 flex flex-col gap-2">
              {survey.options.map((opt, i) => {
                const isSel = selected === i
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isSel ? 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isSel
                        ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
                        : <Circle size={18} className="mt-0.5 shrink-0 text-gray-300" />}
                      <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {survey.options.map((opt, i) => {
                const isChoice = selected === i
                return (
                  <div key={i}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className={`font-medium ${isChoice ? 'text-blue-700' : 'text-gray-700'}`}>
                        {opt.label}{isChoice && ' ✓'}
                      </span>
                      <span className="text-gray-500">{opt.percent}%</span>
                    </div>
                    <Progress value={opt.percent} className="h-2" />
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-gray-500">{survey.n} Teilnehmer</span>
            {voted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 size={16} /> Abgestimmt (Beispiel)
              </span>
            ) : (
              <button
                onClick={() => selected !== null && setVoted(true)}
                disabled={selected === null}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Jetzt abstimmen
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-gray-400">Beispiel-Umfrage · deine Stimme wird nicht gespeichert.</p>
        </div>
      </div>
    </div>
  )
}
