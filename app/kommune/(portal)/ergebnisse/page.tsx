import Link from 'next/link'
import { PROCESSES, STATUS_META } from '@/lib/kommune/demo'
import { RESULTS } from '@/lib/kommune/detail'
import { ArrowRight } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  angenommen: 'bg-green-50 text-green-700 border-green-100',
  in_pruefung: 'bg-amber-50 text-amber-700 border-amber-100',
  abgelehnt: 'bg-red-50 text-red-600 border-red-100',
}
const STATUS_LABEL: Record<string, string> = { angenommen: 'Angenommen', in_pruefung: 'In Prüfung', abgelehnt: 'Nicht angenommen' }

export default function ErgebnissePage() {
  const mitErgebnis = PROCESSES.filter(p => RESULTS[p.slug])
  const andere = PROCESSES.filter(p => (p.status === 'in_auswertung' || p.status === 'abgeschlossen') && !RESULTS[p.slug])

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ergebnisse</h1>
        <p className="mt-0.5 text-sm text-gray-500">Was Bürger:innen gesagt haben — und was die Stadt daraus macht.</p>
      </div>

      {mitErgebnis.map(p => {
        const r = RESULTS[p.slug]
        return (
          <div key={p.slug} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${p.accent}`}>{p.emoji}</span>
              <div>
                <h2 className="font-semibold text-gray-900">{p.title}</h2>
                <span className={`text-xs font-medium ${STATUS_META[p.status].badge} rounded-full px-2 py-0.5`}>{STATUS_META[p.status].label}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900">Das haben Sie uns gesagt</h3>
              <p className="mt-0.5 text-xs text-gray-400">{r.teilnehmende.toLocaleString('de-DE')} Teilnehmende</p>
              <div className="mt-4 flex flex-col gap-3">
                {r.aussagen.map(a => (
                  <div key={a.label}>
                    <div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-700">{a.label}</span><span className="tabular-nums text-gray-500">{a.percent}%</span></div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${a.percent}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900">Das macht die Stadt daraus</h3>
              <div className="mt-4 flex flex-col gap-3">
                {r.massnahmen.map(m => (
                  <div key={m.text} className={`rounded-xl border px-4 py-3 ${STATUS_STYLE[m.status]}`}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide">{STATUS_LABEL[m.status]}</div>
                    <div className="mt-0.5 text-sm font-medium text-gray-900">{m.text}</div>
                    {m.grund && <div className="mt-1 text-xs text-gray-600">Begründung: {m.grund}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {andere.length > 0 && (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Weitere ausgewertete Verfahren</h2>
          <div className="flex flex-col gap-2">
            {andere.map(p => (
              <Link key={p.slug} href={`/beteiligungen/${p.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-blue-200 transition-colors">
                <span className="text-sm font-medium text-gray-900">{p.title}</span>
                <ArrowRight size={15} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
