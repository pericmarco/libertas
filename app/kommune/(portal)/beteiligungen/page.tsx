import { PROCESSES } from '@/lib/kommune/demo'
import ProcessCard from '@/components/kommune/ProcessCard'

export default function BeteiligungenListe() {
  const laufend = PROCESSES.filter(p => p.status === 'beteiligung_laeuft')
  const weitere = PROCESSES.filter(p => p.status !== 'beteiligung_laeuft')

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beteiligungen</h1>
        <p className="mt-0.5 text-sm text-gray-500">Alle Beteiligungsverfahren Ihrer Stadt — laufend, geplant und ausgewertet.</p>
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Laufend</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {laufend.map(p => <ProcessCard key={p.slug} p={p} />)}
      </div>

      {weitere.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Geplant & ausgewertet</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weitere.map(p => <ProcessCard key={p.slug} p={p} />)}
          </div>
        </>
      )}
    </main>
  )
}
