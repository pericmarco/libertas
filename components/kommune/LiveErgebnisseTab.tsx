'use client'

import { useEffect, useMemo, useState } from 'react'
import { Users, MessageSquare, Heart, Radio, BarChart3, Lightbulb, Layers, Map as MapIcon, Wallet } from 'lucide-react'
import type { ParticipationProcess } from '@/lib/kommune/demo'
import { IDEAS, POLLS, VARIANTS } from '@/lib/kommune/detail'
import { MAP_CONTRIB, MAP_CATEGORY, type MapCategory } from '@/lib/kommune/mapdialog'
import { BUDGETS, euroBudget } from '@/lib/kommune/budget'

const nf = new Intl.NumberFormat('de-DE')

// Live-Zwischenstand einer laufenden Beteiligung. Zieht je nach aktivierten
// Modulen die passenden Kennzahlen zusammen. „Live" wird glaubwürdig simuliert
// (kleine, unregelmäßige Zuwächse), solange die Demo keine echte DB hat.
export default function LiveErgebnisseTab({ p }: { p: ParticipationProcess }) {
  const [extra, setExtra] = useState({ teilnehmende: 0, beitraege: 0, reaktionen: 0 })
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setExtra(e => ({
        teilnehmende: e.teilnehmende + Math.floor(Math.random() * 3),
        beitraege: e.beitraege + (Math.random() < 0.3 ? 1 : 0),
        reaktionen: e.reaktionen + Math.floor(Math.random() * 4),
      }))
      setPulse(true)
      setTimeout(() => setPulse(false), 900)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const stats = [
    { icon: Users, label: 'Teilnehmende', value: p.stats.teilnehmende + extra.teilnehmende },
    { icon: MessageSquare, label: 'Beiträge', value: p.stats.beitraege + extra.beitraege },
    { icon: Heart, label: 'Reaktionen', value: p.stats.reaktionen + extra.reaktionen },
  ].filter(s => s.value > 0)

  const poll = p.modules.includes('umfrage') ? POLLS[p.slug] : undefined
  const ideas = useMemo(
    () => (p.modules.includes('ideen') ? [...(IDEAS[p.slug] ?? [])].sort((a, b) => b.supports - a.supports).slice(0, 3) : []),
    [p.slug, p.modules],
  )
  const variants = p.modules.includes('varianten') ? VARIANTS[p.slug] : undefined
  const leadVariant = variants ? [...variants].sort((a, b) => b.votes - a.votes)[0] : undefined
  const contribs = useMemo(
    () => (p.modules.includes('karte') ? MAP_CONTRIB[p.slug] ?? [] : []),
    [p.slug, p.modules],
  )
  const budget = p.modules.includes('buergerbudget') ? BUDGETS[p.slug] : undefined

  const catCounts = useMemo(() => {
    const c: Record<MapCategory, number> = { vorschlag: 0, problem: 0, lob: 0 }
    contribs.forEach(x => { c[x.category]++ })
    return c
  }, [contribs])

  return (
    <div className="flex flex-col gap-4">
      {/* Live-Kopf */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
          <span className={`h-2 w-2 rounded-full bg-red-500 transition-opacity ${pulse ? 'opacity-40' : 'opacity-100'}`} />
          <Radio size={12} /> Live
        </span>
        <span className="text-xs text-gray-400">Zwischenstand · wird laufend aktualisiert</span>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4">
            <s.icon size={16} className="text-blue-500" />
            <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{nf.format(s.value)}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Umfrage-Zwischenstand */}
      {poll && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><BarChart3 size={16} className="text-blue-600" /> Umfrage – aktueller Stand</h3>
          <p className="mt-0.5 text-xs text-gray-400">{poll.question}</p>
          <div className="mt-4 flex flex-col gap-3">
            {poll.options.map(o => (
              <div key={o.label}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-700">{o.label}</span><span className="tabular-nums text-gray-500">{o.percent}%</span></div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${o.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-Ideen */}
      {ideas.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><Lightbulb size={16} className="text-blue-600" /> Beliebteste Ideen</h3>
          <ol className="mt-3 flex flex-col gap-2.5">
            {ideas.map((i, idx) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{idx + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{i.title}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm text-green-600"><Heart size={13} /> {i.supports}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Varianten-Führung */}
      {variants && leadVariant && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><Layers size={16} className="text-blue-600" /> Variantenvergleich</h3>
          <div className="mt-3 flex flex-col gap-2.5">
            {[...variants].sort((a, b) => b.votes - a.votes).map(v => {
              const max = Math.max(...variants.map(x => x.votes), 1)
              const lead = v.id === leadVariant.id
              return (
                <div key={v.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={`font-medium ${lead ? 'text-blue-700' : 'text-gray-700'}`}>{v.emoji} {v.name}{lead && ' · führt'}</span>
                    <span className="tabular-nums text-gray-500">{nf.format(v.votes)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${lead ? 'bg-blue-600' : 'bg-blue-300'}`} style={{ width: `${(v.votes / max) * 100}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Kartendialog-Zusammenfassung */}
      {contribs.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><MapIcon size={16} className="text-blue-600" /> Beiträge auf der Karte</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['vorschlag', 'problem', 'lob'] as MapCategory[]).map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: MAP_CATEGORY[c].color + '1a', color: MAP_CATEGORY[c].color }}>
                {MAP_CATEGORY[c].emoji} {catCounts[c]} {MAP_CATEGORY[c].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bürgerbudget-Zwischenstand */}
      {budget && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><Wallet size={16} className="text-blue-600" /> Bürgerbudget – beliebteste Projekte</h3>
          <p className="mt-0.5 text-xs text-gray-400">Budget {euroBudget(budget.total)}</p>
          <ol className="mt-3 flex flex-col gap-2.5">
            {[...budget.projects].sort((a, b) => b.supports - a.supports).slice(0, 3).map((pr, idx) => (
              <li key={pr.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{idx + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{pr.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-gray-500">{euroBudget(pr.cost)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">Demo · Live-Werte werden simuliert und nicht gespeichert.</p>
    </div>
  )
}
