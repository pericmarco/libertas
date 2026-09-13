'use client'

import { useMemo, useState } from 'react'
import { Wallet, MapPin, ThumbsUp, Check, Plus, Info } from 'lucide-react'
import { BUDGETS, BUDGET_CAT, euroBudget, type BudgetProject } from '@/lib/kommune/budget'

export default function BuergerbudgetTab({ slug }: { slug: string }) {
  const pot = BUDGETS[slug]
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [supported, setSupported] = useState<Set<string>>(new Set())

  const projects = useMemo(
    () => (pot ? [...pot.projects].sort((a, b) => (b.supports + (supported.has(b.id) ? 1 : 0)) - (a.supports + (supported.has(a.id) ? 1 : 0))) : []),
    [pot, supported],
  )

  if (!pot) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
        Für dieses Verfahren ist noch kein Bürgerbudget hinterlegt.
      </div>
    )
  }

  const spent = [...picked].reduce((s, id) => s + (pot.projects.find(p => p.id === id)?.cost ?? 0), 0)
  const remaining = pot.total - spent
  const pct = Math.min((spent / pot.total) * 100, 100)

  function togglePick(p: BudgetProject) {
    setPicked(prev => {
      const n = new Set(prev)
      if (n.has(p.id)) n.delete(p.id)
      else if (spent + p.cost <= pot.total) n.add(p.id)
      return n
    })
  }
  function toggleSupport(id: string) {
    setSupported(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Budget-Zähler (klebt oben) */}
      <div className="sticky top-2 z-10 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-gray-900">
            <Wallet size={18} className="text-blue-600" /> Ihr Budget
          </h2>
          <span className="text-sm font-semibold text-gray-900">{euroBudget(pot.total)}</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">{picked.size} vorgemerkt · {euroBudget(spent)} verplant</span>
          <span className={`font-semibold tabular-nums ${remaining === 0 ? 'text-green-600' : 'text-gray-900'}`}>{euroBudget(remaining)} frei</span>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info size={15} className="mt-0.5 shrink-0" /> {pot.phaseNote}
      </div>

      {/* Projekte */}
      <div className="flex flex-col gap-3">
        {projects.map(p => {
          const cat = BUDGET_CAT[p.category]
          const isPicked = picked.has(p.id)
          const isSup = supported.has(p.id)
          const count = p.supports + (isSup ? 1 : 0)
          const affordable = isPicked || spent + p.cost <= pot.total
          return (
            <div key={p.id} className={`rounded-2xl border bg-white p-5 transition-colors ${isPicked ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: cat.color + '1a' }}>{cat.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: cat.color + '1a', color: cat.color }}>{p.category}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} /> {p.district}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-gray-900">{p.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{p.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-gray-900 tabular-nums">{euroBudget(p.cost)}</div>
                  <button onClick={() => toggleSupport(p.id)}
                    className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${isSup ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:text-green-700'}`}>
                    {isSup ? <Check size={12} /> : <ThumbsUp size={12} />} <span className="tabular-nums">{count}</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => togglePick(p)}
                disabled={!affordable}
                className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto ${
                  isPicked
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : affordable
                    ? 'border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700'
                    : 'cursor-not-allowed border border-gray-100 text-gray-300'
                }`}
              >
                {isPicked ? <><Check size={15} /> Vorgemerkt</> : affordable ? <><Plus size={15} /> Für Umsetzung vormerken</> : 'Budget reicht nicht'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400">Demo · Ihre Auswahl wird nicht gespeichert.</p>
    </div>
  )
}
