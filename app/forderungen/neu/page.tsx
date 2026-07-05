'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, Info, CheckCircle, Circle, MapPin, Tag, AlignLeft, Lightbulb, Users, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Sicherheit', 'Verkehr', 'Wohnen', 'Umwelt', 'Soziales', 'Bildung', 'Stadtentwicklung', 'Sonstiges']

const ADDRESSEES_OPTIONS = [
  'Stadt Köln', 'Ordnungsamt', 'Bezirksvertretung', 'Stadtrat',
  'Fraktionen', 'Parteien', 'Verwaltung', 'Ausschüsse', 'Unsicher',
]

const BLOCKED_WORDS = [
  'idiot', 'idioten', 'depp', 'vollidiot', 'scheiß', 'scheiss',
  'wichser', 'arschloch', 'nazi', 'hitler', 'heil', 'kanake', 'nigger',
  'neger', 'judensau', 'behindi', 'mongo', 'verrecke', 'krepier', 'stirb',
]

function containsBlocked(text: string) {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some(w => lower.includes(w))
}

type DemandType = 'forderung' | 'maengel' | null

export default function NeueFordering() {
  const router = useRouter()

  const [demandType, setDemandType] = useState<DemandType>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [addressees, setAddressees] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleAddressee(a: string) {
    setAddressees(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    )
  }

  const isFormVisible = demandType !== null
  const canSubmit = title.trim().length >= 5 && category && problem.trim().length >= 10

  // Auf Mobile direkt nach der Typ-Auswahl sichtbar, auf Desktop in der rechten Spalte
  const qualityHints = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Was macht eine gute Forderung aus?</div>
      <div className="space-y-2.5 mb-4">
        {[
          'Sie beschreibt ein strukturelles Problem.',
          'Sie nennt einen konkreten Ort oder Stadtteil.',
          'Sie schlägt eine nachvollziehbare Veränderung vor.',
        ].map((point, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
            {point}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="bg-red-50 rounded-xl px-3 py-2.5 text-xs leading-relaxed">
          <span className="font-semibold text-red-600">Schwach: </span>
          <span className="text-gray-600">„Am Neumarkt ist alles schlimm."</span>
        </div>
        <div className="bg-green-50 rounded-xl px-3 py-2.5 text-xs leading-relaxed">
          <span className="font-semibold text-green-600">Besser: </span>
          <span className="text-gray-600">„Der Neumarkt wird abends von vielen Menschen als unsicher wahrgenommen. Die Stadt soll ein Konzept aus Ordnungsamt, Streetwork und besserer Beleuchtung prüfen."</span>
        </div>
      </div>
    </div>
  )

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setError('')

    if (containsBlocked(title) || containsBlocked(problem) || containsBlocked(solution)) {
      setError('Deine Forderung enthält unzulässige Ausdrücke. Bitte formuliere sie sachlich.')
      return
    }

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('district_id').eq('id', userData.user.id).single()

    setSubmitting(true)

    const { data, error: dbError } = await supabase.from('demands').insert({
      title: title.trim(),
      description: problem.trim(),
      solution: solution.trim() || null,
      category,
      location: location.trim() || null,
      addressees: addressees.length > 0 ? addressees : null,
      district_id: profile?.district_id ?? null,
      user_id: userData.user.id,
      status: 'eingereicht',
    }).select('id').single()

    setSubmitting(false)

    if (dbError) {
      setError('Fehler beim Einreichen. Bitte nochmal versuchen.')
      return
    }

    router.push(`/forderungen/${data.id}`)
  }

  const previewTitle = title || 'Titel deiner Forderung'
  const previewLocation = location || 'Köln Innenstadt'
  const previewCategory = category || null
  const previewProblem = problem ? (problem.length > 80 ? problem.slice(0, 80) + '…' : problem) : null
  const previewSolution = solution ? (solution.length > 80 ? solution.slice(0, 80) + '…' : solution) : null

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <Link href="/forderungen" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
            <ChevronLeft size={15} /> Alle Forderungen
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Anliegen einreichen</h1>
            <p className="text-gray-500 mt-1">Bring ein Thema aus deinem Stadtteil sichtbar auf den Tisch von Stadt und Verwaltung.</p>
          </div>

          {/* Info-Banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-8 text-sm text-blue-700 leading-relaxed">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>
              Lybertas bündelt beides an einem Ort: strukturelle Anliegen für deinen Stadtteil und konkrete Mängel vor Ort. Alles wird gesammelt und an die richtige Stelle bei Stadt und Verwaltung weitergegeben.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* LEFT: Form */}
            <div className="space-y-4">

              {/* Step 1: Type selector */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Was möchtest du einreichen?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setDemandType('forderung')}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      demandType === 'forderung'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {demandType === 'forderung'
                        ? <CheckCircle size={16} className="text-blue-600" />
                        : <Circle size={16} className="text-gray-300" />
                      }
                      <span className="text-sm font-semibold text-gray-900">Bürgeranliegen</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Für strukturelle Probleme, wiederkehrende Themen oder Verbesserungsvorschläge in deinem Stadtteil.
                    </p>
                  </button>

                  <button
                    onClick={() => setDemandType('maengel')}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      demandType === 'maengel'
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {demandType === 'maengel'
                        ? <CheckCircle size={16} className="text-orange-500" />
                        : <Circle size={16} className="text-gray-300" />
                      }
                      <span className="text-sm font-semibold text-gray-900">Mängelmeldung</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Für einzelne Schäden wie kaputte Laternen, Müll oder Schlaglöcher.
                    </p>
                  </button>
                </div>

                {demandType === 'maengel' && (
                  <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700 leading-relaxed">
                    <strong>Konkrete Mängel vor Ort kannst du hier direkt melden.</strong>
                    <div className="mt-2 text-xs space-y-1">
                      <div>🔧 „Laterne kaputt" → Mängelmeldung</div>
                      <div>📣 „Unser Viertel ist dauerhaft schlecht beleuchtet" → Bürgeranliegen</div>
                    </div>
                    <p className="mt-2 text-xs text-orange-600">
                      Steckt hinter dem Mangel ein größeres, wiederkehrendes Problem, formuliere es als Bürgeranliegen — so bekommt es mehr Gewicht.
                    </p>
                  </div>
                )}
              </div>

              {/* Tipps auf Mobile direkt vor den Eingabefeldern statt ganz unten */}
              {isFormVisible && <div className="lg:hidden">{qualityHints}</div>}

              {/* Step 2: Form fields */}
              {isFormVisible && (
                <>
                  {/* Titel */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlignLeft size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Titel der Forderung</span>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="z. B. Mehr Sicherheit am Neumarkt"
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-2">Formuliere kurz und verständlich, worum es geht.</p>
                  </div>

                  {/* Ort */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ort oder Stadtteil</span>
                    </div>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="z. B. Köln Innenstadt, Neumarkt"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-2">Wo tritt das Problem auf?</p>
                  </div>

                  {/* Kategorie */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kategorie *</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat === category ? '' : cat)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            category === cat
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Problem */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlignLeft size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Was ist das Problem? *</span>
                    </div>
                    <textarea
                      value={problem}
                      onChange={e => setProblem(e.target.value)}
                      placeholder="Beschreibe kurz, was aktuell nicht funktioniert oder viele Menschen betrifft."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">Beschreibe das Problem möglichst konkret, aber nicht zu lang.</p>
                  </div>

                  {/* Lösung */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Was soll konkret passieren?</span>
                    </div>
                    <textarea
                      value={solution}
                      onChange={e => setSolution(e.target.value)}
                      placeholder="Welche Veränderung wünschst du dir von Stadt, Verwaltung oder Politik?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">Eine gute Forderung beschreibt nicht nur das Problem, sondern auch eine mögliche Richtung für die Lösung.</p>
                  </div>

                  {/* Adressaten */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={15} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">An wen richtet sich die Forderung?</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ADDRESSEES_OPTIONS.map(a => (
                        <button
                          key={a}
                          onClick={() => toggleAddressee(a)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            addressees.includes(a)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">Du musst nicht genau wissen, wer zuständig ist. Lybertas kann später helfen, die passenden Adressaten zuzuordnen.</p>
                  </div>

                  {/* Submit */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      Mit dem Einreichen wird deine Forderung für andere Bürger sichtbar. Andere können sie unterstützen, Gegenargumente hinzufügen oder alternative Lösungen vorschlagen.
                    </p>
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || submitting}
                        className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 text-sm"
                      >
                        {submitting ? 'Wird eingereicht…' : 'Forderung veröffentlichen'}
                      </button>
                      <Link
                        href="/forderungen"
                        className="flex-1 sm:flex-none py-3.5 px-6 text-center bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Abbrechen
                      </Link>
                    </div>
                    {!canSubmit && (
                      <p className="text-xs text-gray-400 mt-3">Bitte fülle Titel, Kategorie und Problembeschreibung aus.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Preview + Hints */}
            <div className="space-y-4 lg:sticky lg:top-20">

              {/* Live Preview */}
              {isFormVisible && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vorschau deiner Forderung</span>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {previewCategory && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{previewCategory}</span>
                      )}
                      <span className="text-xs text-gray-400">{previewLocation}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Entwurf</span>
                    </div>

                    <div className={`font-semibold mb-2 leading-snug ${title ? 'text-gray-900' : 'text-gray-300'}`}>
                      {previewTitle}
                    </div>

                    {previewProblem && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-1">
                        <span className="font-medium text-gray-600">Problem: </span>{previewProblem}
                      </p>
                    )}

                    {previewSolution && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">
                        <span className="font-medium text-gray-600">Lösung: </span>{previewSolution}
                      </p>
                    )}

                    {addressees.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {addressees.slice(0, 3).map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{a}</span>
                        ))}
                        {addressees.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">+{addressees.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="font-semibold text-gray-600">0</span> Relevanzpunkte
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">So sieht deine Forderung später für andere Bürger aus.</p>
                </div>
              )}

              {/* Quality hints (Desktop; auf Mobile oben im Formular-Flow) */}
              <div className="hidden lg:block">{qualityHints}</div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
