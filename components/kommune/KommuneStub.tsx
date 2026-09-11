// Schlanker Platzhalter für Kommunal-Seiten, die in einer späteren Phase
// vollständig ausgebaut werden. Bleibt im Portal-Design, kein leerer Screen.
export default function KommuneStub({ title, subtitle, note }: { title: string; subtitle: string; note?: string }) {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
        <div className="mb-2 text-3xl">🛠️</div>
        <div className="font-medium text-gray-700">Dieser Bereich wird gerade aufgebaut</div>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-gray-500">
          {note ?? 'Er ist Teil des Kommunal-Portals und folgt in Kürze — die Architektur ist bereits darauf ausgelegt.'}
        </p>
      </div>
    </main>
  )
}
