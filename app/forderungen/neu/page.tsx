'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ChevronLeft, ChevronDown, CheckCircle, Circle, Info, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { containsBlocked, REGION_NAME } from '@/lib/constants'
import {
  type Anliegenart, ART_OPTIONS, ART_LABELS, ORTSTYPEN, SCOPE_LABELS,
  THEMENBEREICHE, themenForTags, MAX_TAGS, FREQUENZEN, GRUPPEN,
  AUSWIRKUNGEN, LOESUNGSRICHTUNGEN, FEEDBACK_OPTIONS, FEEDBACK_LABELS,
} from '@/lib/einreichung'

type District = { id: string; name: string }

const STEPS = ['Art', 'Ort', 'Titel', 'Themen', 'Problem', 'Veränderung', 'Rückmeldung', 'Vorschau']

export default function NeueForderung() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [districts, setDistricts] = useState<District[]>([])

  // Schritt 1: Art
  const [art, setArt] = useState<Anliegenart | null>(null)

  // Schritt 2: Ort
  const [scope, setScope] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [ortstyp, setOrtstyp] = useState('')
  const [ortText, setOrtText] = useState('')
  const [ortZusatz, setOrtZusatz] = useState('')
  const [mehrereOrteText, setMehrereOrteText] = useState('')

  // Schritt 3: Titel
  const [title, setTitle] = useState('')
  const [similar, setSimilar] = useState<{ id: string; title: string; relevance_score: number }[]>([])

  // Schritt 4: Tags
  const [tags, setTags] = useState<string[]>([])
  const [openBereich, setOpenBereich] = useState<string | null>(null)

  // Schritt 5: Problem
  const [problem, setProblem] = useState('')
  const [frequency, setFrequency] = useState('')
  const [zusatzOpen, setZusatzOpen] = useState(false)
  const [groups, setGroups] = useState<string[]>([])
  const [impacts, setImpacts] = useState<string[]>([])

  // Schritt 6: Veränderung
  const [change, setChange] = useState('')
  const [direction, setDirection] = useState('')

  // Schritt 7: Rückmeldung
  const [feedback, setFeedback] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: region } = await supabase.from('regions').select('id').eq('name', REGION_NAME).single()
      if (!region) return
      const { data } = await supabase.from('districts').select('id, name').eq('region_id', region.id)
      if (data) setDistricts(data)
    }
    load()
  }, [])

  // Duplikatprüfung beim Tippen des Titels
  useEffect(() => {
    const q = title.trim()
    if (q.length < 8) { setSimilar([]); return }
    const t = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase.rpc('similar_demands', { q })
      setSimilar(data ?? [])
    }, 500)
    return () => clearTimeout(t)
  }, [title])

  // Ortsebenen je Anliegenart (Mangel = immer konkreter Ort)
  const scopeOptions =
    art === 'wiederkehrend' ? ['ort', 'stadtteil', 'mehrere_orte', 'ganz_koeln', 'unsicher'] :
    art === 'vorschlag'     ? ['ort', 'stadtteil', 'mehrere_stadtteile', 'ganz_koeln', 'unsicher'] :
    []
  const effectiveScope = art === 'mangel' ? 'ort' : scope
  const needsKonkreterOrt = effectiveScope === 'ort'
  const needsDistrict = ['ort', 'stadtteil', 'mehrere_orte'].includes(effectiveScope)

  const districtName = districts.find(d => d.id === districtId)?.name ?? ''
  const ortstypInfo = ORTSTYPEN.find(o => o.value === ortstyp)
  const themen = themenForTags(tags)

  // Weiche Titel-Hinweise (blockieren nicht)
  const titleTrimmed = title.trim()
  const titleHint =
    titleTrimmed.length > 0 && titleTrimmed.length < 15
      ? 'Dein Titel wirkt noch sehr allgemein. Ein konkreter Titel hilft anderen, dein Anliegen schneller zu verstehen.'
      : /!{2,}/.test(titleTrimmed) || /\b(unfassbar|skandal|endlich handeln|frechheit)\b/i.test(titleTrimmed)
      ? 'Dein Titel wirkt sehr emotional. Sachliche Titel werden von anderen eher unterstützt.'
      : ''

  const problemHint = problem.trim().length > 0 && problem.trim().length < 60
    ? 'Je konkreter die Beschreibung, desto besser kann dein Anliegen geprüft werden — ein bis zwei Sätze mehr helfen.'
    : ''
  const changeHint = change.trim().length > 0 && change.trim().length < 40
    ? 'Beschreibe die gewünschte Veränderung ruhig etwas ausführlicher.'
    : ''

  function canProceed(s: number): boolean {
    switch (s) {
      case 0: return art !== null
      case 1:
        if (art === 'mangel') return !!districtId && !!ortstyp && ortText.trim().length > 0
        if (!scope) return false
        if (scope === 'ort') return !!districtId && !!ortstyp && ortText.trim().length > 0
        if (scope === 'stadtteil' || scope === 'mehrere_orte') return !!districtId
        return true
      case 2: return titleTrimmed.length >= 5 && titleTrimmed.length <= 90
      case 3: return tags.length >= 1 && tags.length <= MAX_TAGS
      case 4: return problem.trim().length >= 20 && (art !== 'wiederkehrend' || !!frequency)
      case 5: return change.trim().length >= 15
      case 6: return art === 'mangel' || !!feedback
      default: return true
    }
  }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : prev.length >= MAX_TAGS ? prev : [...prev, tag])
  }

  function toggleIn(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  // Kompakte Ortszusammenfassung für Statuszeile + Speicherung
  function ortSummary(): string {
    if (effectiveScope === 'ort' && ortstypInfo) {
      return `${ortstypInfo.label}: ${ortText.trim()}${ortZusatz.trim() ? `, ${ortZusatz.trim()}` : ''} (${districtName})`
    }
    if (effectiveScope === 'stadtteil') return districtName
    if (effectiveScope === 'mehrere_orte') return `Mehrere Orte in ${districtName}${mehrereOrteText.trim() ? `: ${mehrereOrteText.trim()}` : ''}`
    if (effectiveScope === 'mehrere_stadtteile') return 'Mehrere Stadtteile'
    if (effectiveScope === 'ganz_koeln') return 'Ganz Köln'
    return 'Ort unklar'
  }

  async function handleSubmit() {
    setError('')

    if (containsBlocked(title) || containsBlocked(problem) || containsBlocked(change)) {
      setError('Bitte formuliere dein Anliegen sachlich, damit es veröffentlicht und von anderen besser unterstützt werden kann.')
      return
    }

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    setSubmitting(true)

    const { data, error: dbError } = await supabase.from('demands').insert({
      title: titleTrimmed,
      description: problem.trim(),
      solution: change.trim(),
      category: themen[0] ?? 'Sonstiges',
      tags,
      submission_type: art,
      location_scope: effectiveScope,
      location_type: needsKonkreterOrt ? ortstyp : null,
      location: ortSummary(),
      frequency: frequency || null,
      affected_groups: groups.length > 0 ? groups : null,
      impacts: impacts.length > 0 ? impacts : null,
      solution_direction: direction || null,
      feedback_wanted: art === 'mangel' ? 'stadt' : feedback,
      district_id: needsDistrict ? districtId : null,
      user_id: userData.user.id,
      status: 'eingereicht',
    }).select('id').single()

    setSubmitting(false)

    if (dbError) {
      if (dbError.message.includes('RATE_LIMIT_DAY')) {
        setError('Du hast heute bereits 3 Anliegen eingereicht. Bitte versuche es morgen wieder.')
      } else if (dbError.message.includes('RATE_LIMIT_WEEK')) {
        setError('Du hast diese Woche bereits 10 Anliegen eingereicht. Bitte versuche es nächste Woche wieder.')
      } else {
        setError('Fehler beim Einreichen. Bitte nochmal versuchen.')
      }
      return
    }

    router.push(`/forderungen/${data.id}`)
  }

  // Statuszeile der bisherigen Antworten
  const statusParts: string[] = []
  if (step > 0 && art) statusParts.push(ART_LABELS[art])
  if (step > 1) statusParts.push(ortSummary())
  if (step > 3 && themen.length > 0) statusParts.push(themen.join(', '))

  const bigCard = (selected: boolean) =>
    `w-full text-left p-5 rounded-2xl border-2 transition-all ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
    }`

  const chip = (selected: boolean, disabled = false) =>
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
      selected ? 'bg-blue-600 text-white border-blue-600'
      : disabled ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
    }`

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          <Link href="/forderungen" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5">
            <ChevronLeft size={15} /> Alle Forderungen
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Anliegen einreichen</h1>
          <p className="text-gray-500 text-sm mb-5">
            Schritt {Math.min(step + 1, STEPS.length)} von {STEPS.length} · {STEPS[step]}
          </p>

          {/* Fortschritt */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          {/* Statuszeile bisheriger Antworten */}
          {statusParts.length > 0 && step < 7 && (
            <div className="text-xs text-gray-400 mb-5 truncate">{statusParts.join(' · ')}</div>
          )}

          {/* ── Schritt 1: Art ── */}
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <div className="text-base font-semibold text-gray-900 mb-1">Was beschreibt dein Anliegen am besten?</div>
              {ART_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setArt(o.value)} className={bigCard(art === o.value)}>
                  <div className="flex items-center gap-2 mb-1">
                    {art === o.value ? <CheckCircle size={17} className="text-blue-600 shrink-0" /> : <Circle size={17} className="text-gray-300 shrink-0" />}
                    <span className="font-semibold text-gray-900">{o.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-6">{o.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* ── Schritt 2: Ort ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {art !== 'mangel' && (
                <div>
                  <div className="text-base font-semibold text-gray-900 mb-3">
                    {art === 'wiederkehrend' ? 'Wo tritt das Problem auf?' : 'Auf welchen Bereich bezieht sich dein Vorschlag?'}
                  </div>
                  <div className="flex flex-col gap-2">
                    {scopeOptions.map(s => (
                      <button key={s} onClick={() => setScope(s)} className={bigCard(scope === s)}>
                        <div className="flex items-center gap-2">
                          {scope === s ? <CheckCircle size={16} className="text-blue-600 shrink-0" /> : <Circle size={16} className="text-gray-300 shrink-0" />}
                          <span className="text-sm font-semibold text-gray-900">{SCOPE_LABELS[s]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {art === 'mangel' && (
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 leading-relaxed">
                  <Info size={15} className="shrink-0 mt-0.5" />
                  Bitte gib den Ort so genau wie möglich an, damit der Zustand gefunden und geprüft werden kann.
                </div>
              )}

              {needsDistrict && (art === 'mangel' || scope) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stadtteil *</label>
                  <select
                    value={districtId}
                    onChange={e => setDistrictId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Stadtteil wählen…</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {needsKonkreterOrt && (art === 'mangel' || scope === 'ort') && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Um was für einen Ort geht es? *</label>
                    <div className="flex flex-wrap gap-2">
                      {ORTSTYPEN.map(o => (
                        <button key={o.value} onClick={() => setOrtstyp(o.value)} className={chip(ortstyp === o.value)}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {ortstypInfo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{ortstypInfo.frage} *</label>
                      <input
                        value={ortText}
                        onChange={e => setOrtText(e.target.value)}
                        placeholder={ortstyp === 'haltestelle' ? 'z. B. Christophstraße/MediaPark' : ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {ortstyp === 'strasse' && (
                        <input
                          value={ortZusatz}
                          onChange={e => setOrtZusatz(e.target.value)}
                          placeholder="Hausnummer oder nähere Beschreibung (optional)"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {scope === 'mehrere_orte' && districtId && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Welche Orte sind ungefähr betroffen? (optional)</label>
                  <input
                    value={mehrereOrteText}
                    onChange={e => setMehrereOrteText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Schritt 3: Titel ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Titel deines Anliegens *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={90}
                  placeholder='z. B. "Dauerhafte Geruchsbelästigung an der Haltestelle Christophstraße lösen"'
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Ein guter Titel nennt kurz Problem, Ort und Ziel. Vermeide reine Empörung wie „Unfassbar!!!" oder „Endlich handeln".
                </p>
              </div>

              {titleHint && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">{titleHint}</div>
              )}

              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-500">Beispiele:</span> Mehr Sicherheit am Neumarkt schaffen · Regelmäßige Vermüllung am MediaPark reduzieren · Bessere Beleuchtung am Ebertplatz prüfen
              </div>

              {similar.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-blue-700 mb-2">
                    Ähnliche Forderungen gibt es schon — vielleicht lieber unterstützen statt doppelt einreichen?
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {similar.map(sd => (
                      <a key={sd.id} href={`/forderungen/${sd.id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 text-sm text-blue-700 hover:underline">
                        <span className="truncate">{sd.title}</span>
                        <span className="text-xs text-blue-400 shrink-0">{sd.relevance_score} Punkte →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Schritt 4: Themen & Tags ── */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">Welche Themen berührt dein Anliegen?</div>
                <p className="text-sm text-gray-500 mt-1">
                  Gehe die Themenbereiche durch und wähle die Schlagworte, die am besten passen — mindestens eins, höchstens {MAX_TAGS}.
                </p>
              </div>

              {Object.entries(THEMENBEREICHE).map(([bereich, bereichTags]) => {
                const isOpen = openBereich === bereich
                const selectedCount = bereichTags.filter(t => tags.includes(t)).length
                return (
                  <div key={bereich} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setOpenBereich(isOpen ? null : bereich)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-gray-900 text-sm">
                        {bereich}
                        {selectedCount > 0 && <span className="ml-2 text-xs font-medium text-blue-600">{selectedCount} gewählt</span>}
                      </span>
                      <ChevronDown size={16} className={`text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 flex flex-wrap gap-2">
                        {bereichTags.map(t => (
                          <button key={t} onClick={() => toggleTag(t)} className={chip(tags.includes(t), !tags.includes(t) && tags.length >= MAX_TAGS)}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {tags.length > 0 && (
                <div className="text-xs text-gray-500">
                  Gewählt: {tags.join(', ')} → Themenbereiche: <span className="font-medium text-gray-700">{themen.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Schritt 5: Problem ── */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <label className="block text-base font-semibold text-gray-900 mb-2">Beschreibe das Problem *</label>
                <textarea
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  rows={5}
                  placeholder="Was passiert? Warum ist es problematisch? Wen betrifft es?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">Beschreibe das Problem möglichst konkret. Es reicht, wenn du die Situation verständlich erklärst.</p>
                {problemHint && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mt-2">{problemHint}</div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wie häufig tritt das Problem auf? {art === 'wiederkehrend' ? '*' : '(optional)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENZEN.map(f => (
                    <button key={f} onClick={() => setFrequency(frequency === f ? '' : f)} className={chip(frequency === f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setZusatzOpen(!zusatzOpen)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-medium text-gray-600">Weitere Angaben, falls relevant (optional)</span>
                  <ChevronDown size={16} className={`text-gray-300 transition-transform ${zusatzOpen ? 'rotate-180' : ''}`} />
                </button>
                {zusatzOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Wer ist besonders betroffen?</div>
                      <div className="flex flex-wrap gap-2">
                        {GRUPPEN.map(g => (
                          <button key={g} onClick={() => toggleIn(groups, setGroups, g)} className={chip(groups.includes(g))}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Welche Auswirkung hat das Problem?</div>
                      <div className="flex flex-wrap gap-2">
                        {AUSWIRKUNGEN.map(a => (
                          <button key={a} onClick={() => toggleIn(impacts, setImpacts, a)} className={chip(impacts.includes(a))}>{a}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Schritt 6: Veränderung ── */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <label className="block text-base font-semibold text-gray-900 mb-2">Was sollte sich ändern? *</label>
                <textarea
                  value={change}
                  onChange={e => setChange(e.target.value)}
                  rows={4}
                  placeholder="Was wäre aus deiner Sicht eine gute Lösung oder welche Veränderung wünschst du dir?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">Du musst keine perfekte Lösung kennen. Beschreibe einfach, was sich aus deiner Sicht ändern sollte.</p>
                {changeHint && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mt-2">{changeHint}</div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">In welche Richtung geht die Lösung? (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {LOESUNGSRICHTUNGEN.map(d => (
                    <button key={d} onClick={() => setDirection(direction === d ? '' : d)} className={chip(direction === d)}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Schritt 7: Rückmeldung (entfällt bei Mängelmeldungen) ── */}
          {step === 6 && art === 'mangel' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Deine Mängelmeldung geht direkt an das Lybertas-Team.</div>
                  Wir prüfen sie und leiten sie an die zuständige Stelle der Stadt weiter. Sie erscheint nicht in der
                  öffentlichen Forderungsliste und wird nicht zur Abstimmung gestellt — du kannst ihren Stand jederzeit
                  über den Link nach dem Einreichen verfolgen.
                </div>
              </div>
            </div>
          )}
          {step === 6 && art !== 'mangel' && (
            <div className="flex flex-col gap-3">
              <div className="text-base font-semibold text-gray-900 mb-1">Von wem wünschst du dir eine Rückmeldung?</div>
              {FEEDBACK_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setFeedback(o.value)} className={bigCard(feedback === o.value)}>
                  <div className="flex items-center gap-2 mb-1">
                    {feedback === o.value ? <CheckCircle size={17} className="text-blue-600 shrink-0" /> : <Circle size={17} className="text-gray-300 shrink-0" />}
                    <span className="font-semibold text-gray-900">{o.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-6">{o.desc}</p>
                </button>
              ))}
              <p className="text-xs text-gray-400 mt-1">
                Die konkrete Zuständigkeit ordnet das Lybertas-Team anschließend intern zu — du musst nicht wissen, welches Amt oder Gremium zuständig ist.
              </p>
            </div>
          )}

          {/* ── Schritt 8: Vorschau ── */}
          {step === 7 && (
            <div className="flex flex-col gap-3">
              <div className="text-base font-semibold text-gray-900">So wird dein Anliegen eingereicht</div>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {([
                  ['Titel', titleTrimmed, 2],
                  ['Art des Anliegens', art ? ART_LABELS[art] : '', 0],
                  ['Ort', ortSummary(), 1],
                  ['Themenbereiche', themen.join(', '), 3],
                  ['Schlagworte', tags.join(', '), 3],
                  ['Problem', problem.trim(), 4],
                  ['Häufigkeit', frequency, 4],
                  ['Betroffene', groups.join(', '), 4],
                  ['Auswirkungen', impacts.join(', '), 4],
                  ['Gewünschte Veränderung', change.trim(), 5],
                  ['Lösungsrichtung', direction, 5],
                  ['Rückmeldung gewünscht von', art === 'mangel' ? 'Lybertas-Team → Stadt / Verwaltung' : FEEDBACK_LABELS[feedback] ?? '', 6],
                ] as [string, string, number][]).filter(([, v]) => v).map(([label, value, editStep]) => (
                  <div key={label} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-sm text-gray-800 leading-relaxed">{value}</div>
                    </div>
                    <button onClick={() => setStep(editStep)} className="text-gray-300 hover:text-blue-600 shrink-0 mt-1" aria-label={`${label} bearbeiten`}>
                      <Pencil size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {art === 'mangel'
                  ? 'Deine Mängelmeldung geht an das Lybertas-Team und wird an die zuständige Stelle weitergeleitet. Sie erscheint nicht in der öffentlichen Forderungsliste.'
                  : 'Mit dem Einreichen wird dein Anliegen für andere Bürger sichtbar. Andere können es unterstützen, Gegenargumente hinzufügen oder Alternativen vorschlagen.'}
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mt-4">{error}</div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 0 ? (
              <button onClick={() => { setStep(step - 1); setError('') }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ChevronLeft size={15} /> Zurück
              </button>
            ) : <div />}

            {step < 7 ? (
              <button
                onClick={() => canProceed(step) && setStep(step + 1)}
                disabled={!canProceed(step)}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Wird eingereicht…' : 'Anliegen einreichen'}
              </button>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
