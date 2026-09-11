import { Palette, Building2, Landmark } from 'lucide-react'

const input = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const label = 'block text-sm font-medium text-gray-700 mb-1.5'

// Branding-/White-Label-Vorschau. Zeigt, dass das Portal je Stadt konfigurierbar
// ist (Name, Farben, Logo, Fachämter, Kontakt). In der Demo statisch.
export default function AdminEinstellungen() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-0.5 text-sm text-gray-500">So passt Ihre Kommune das Portal an ihr Erscheinungsbild an.</p>
      </div>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400"><Palette size={14} /> Erscheinungsbild</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={label}>Stadtname</label><input className={input} defaultValue="Musterstadt" /></div>
            <div><label className={label}>Domain</label><input className={input} defaultValue="beteiligung.musterstadt.de" /></div>
            <div>
              <label className={label}>Primärfarbe</label>
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-lg border border-gray-200" style={{ background: '#2563EB' }} />
                <input className={input} defaultValue="#2563EB" />
              </div>
            </div>
            <div><label className={label}>Logo</label><div className="flex h-[46px] items-center rounded-xl border border-dashed border-gray-300 px-4 text-sm text-gray-400">Stadtlogo hochladen…</div></div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400"><Building2 size={14} /> Fachämter</div>
          <div className="flex flex-wrap gap-2">
            {['Stadtplanungsamt', 'Tiefbauamt', 'Grünflächenamt', 'Ordnungsamt', 'Amt für Verkehr', 'Kämmerei', 'Abfallwirtschaft'].map(a => (
              <span key={a} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">{a}</span>
            ))}
            <button className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-600">+ Amt</button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400"><Landmark size={14} /> Kontakt & Rechtliches</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={label}>Kontakt-E-Mail</label><input className={input} defaultValue="beteiligung@musterstadt.de" /></div>
            <div><label className={label}>Ansprechperson</label><input className={input} defaultValue="Amt für Bürgerbeteiligung" /></div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Impressum und Datenschutzerklärung werden je Kommune hinterlegt.</p>
        </section>

        <div>
          <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Speichern</button>
          <span className="ml-3 text-xs text-gray-400">Demo · Änderungen werden nicht gespeichert</span>
        </div>
      </div>
    </main>
  )
}
