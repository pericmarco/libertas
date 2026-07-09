'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Plus, ChevronRight, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { THEMENBEREICHE, themenForTags } from '@/lib/einreichung'
import DemandCard, { type Demand } from '@/components/DemandCard'
import LockedDemandTeaser from '@/components/LockedDemandTeaser'
import ForderungenMapCard from '@/components/ForderungenMapCard'
import type { MapPin } from '@/components/MapView'

// Wie viele Forderungen ein nicht angemeldeter Besucher voll sehen darf,
// bevor der Rest als gesperrte Teaser erscheint.
const PUBLIC_PREVIEW_COUNT = 2

const STATUS_LABEL: Record<string, string> = {
  eingereicht: 'Eingereicht', geprüft: 'Geprüft', bearbeitet: 'In Bearbeitung',
  umgesetzt: 'Umgesetzt', abgelehnt: 'Abgelehnt',
}

// Wie viele Karten pro Kategorie-Reihe in der "Alle"-Ansicht gezeigt werden,
// bevor "Alle anzeigen" in die Kategorie-Ansicht führt.
const ROW_LIMIT = 10

// Alt-Forderungen (vor dem Tag-System) tragen nur eine Kategorie —
// fürs Filtern auf die neuen Themenbereiche abbilden
const OLD_CATEGORY_TO_BEREICH: Record<string, string> = {
  'Verkehr': 'Verkehr & Mobilität',
  'Sicherheit': 'Sicherheit & Ordnung',
  'Umwelt': 'Umwelt & Sauberkeit',
  'Wohnen': 'Wohnen',
  'Soziales': 'Soziales & Zusammenleben',
  'Bildung': 'Bildung & Betreuung',
  'Stadtentwicklung': 'Stadtentwicklung & öffentlicher Raum',
  'Sonstiges': 'Sonstiges',
}

// Themenbereiche einer Forderung. Fällt auf "Sonstiges" zurück, damit keine
// Forderung in der nach Bereichen gegliederten Ansicht verschwindet.
function areasForDemand(d: Demand): string[] {
  if (d.tags && d.tags.length > 0) {
    const areas = themenForTags(d.tags)
    if (areas.length > 0) return areas
  }
  if (d.category) return [OLD_CATEGORY_TO_BEREICH[d.category] ?? d.category]
  return ['Sonstiges']
}

export default function Forderungen() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [positions, setPositions] = useState<Record<string, string>>({})
  const [textCounts, setTextCounts] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mapPins, setMapPins] = useState<MapPin[]>([])

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const [{ data: demandsData }, { data: argsData }] = await Promise.all([
        supabase.from('demands').select('id, title, description, category, tags, relevance_score, status')
          .neq('status', 'zurückgezogen')
          // Mängelmeldungen gehen ans Lybertas-Team, nicht in die öffentliche Liste
          .or('submission_type.is.null,submission_type.neq.mangel')
          .order('relevance_score', { ascending: false }),
        supabase.from('demand_arguments').select('demand_id, user_id, text'),
      ])

      setDemands(demandsData ?? [])

      // Verortete Forderungen für die Karte (defensiv: fehlen die Geo-Spalten
      // noch, bleibt die Karte einfach ohne echte Pins → Demo-Ansicht).
      const { data: geoData, error: geoErr } = await supabase.from('demands')
        .select('id, title, category, status, lat, lng')
        .neq('status', 'zurückgezogen')
        .or('submission_type.is.null,submission_type.neq.mangel')
        .not('lat', 'is', null)
        .limit(200)
      if (!geoErr && geoData) {
        setMapPins(
          geoData
            .filter(g => g.lat != null && g.lng != null)
            .map(g => ({
              id: g.id,
              lng: g.lng as number,
              lat: g.lat as number,
              title: g.title,
              meta: `${g.category} · ${STATUS_LABEL[g.status] ?? g.status}`,
              href: `/forderungen/${g.id}`,
            }))
        )
      }

      // Textbeiträge pro Forderung zählen (Positionen ohne Text sind keine "Beiträge")
      const counts: Record<string, number> = {}
      const mine: Record<string, string> = {}
      for (const row of argsData ?? []) {
        if (row.text && row.text.trim().length > 0) counts[row.demand_id] = (counts[row.demand_id] ?? 0) + 1
      }
      setTextCounts(counts)

      if (uid) {
        const { data: own } = await supabase.from('demand_arguments').select('demand_id, type').eq('user_id', uid)
        for (const row of own ?? []) mine[row.demand_id] = row.type
        setPositions(mine)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function toggleSupport(e: React.MouseEvent, demandId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) { router.push('/login'); return }

    const current = positions[demandId]

    // Wer bereits eine andere Position hat, wechselt sie bewusst auf der Detailseite
    if (current === 'gegenargument' || current === 'alternative') {
      router.push(`/forderungen/${demandId}`)
      return
    }

    const supabase = createClient()
    const isSupporting = current === 'unterstützend'

    // optimistisch
    setDemands(prev => prev.map(d =>
      d.id === demandId ? { ...d, relevance_score: d.relevance_score + (isSupporting ? -1 : 1) } : d
    ))
    setPositions(prev => {
      const next = { ...prev }
      if (isSupporting) delete next[demandId]
      else next[demandId] = 'unterstützend'
      return next
    })

    if (isSupporting) {
      await supabase.from('demand_arguments').delete().eq('demand_id', demandId).eq('user_id', userId)
    } else {
      await supabase.from('demand_arguments').insert({ demand_id: demandId, user_id: userId, type: 'unterstützend', text: null })
    }
  }

  const openDemand = (id: string) => router.push(`/forderungen/${id}`)

  // Kategorien in der festen Reihenfolge aus THEMENBEREICHE, aber nur solche,
  // die tatsächlich Forderungen enthalten.
  const categoriesWithDemands = Object.keys(THEMENBEREICHE).filter(b =>
    demands.some(d => areasForDemand(d).includes(b))
  )
  const focusDemands = activeCategory
    ? demands.filter(d => areasForDemand(d).includes(activeCategory))
    : []

  // Öffentliche Vorschau (nicht angemeldet): die zwei relevantesten
  // Forderungen voll sichtbar, der Rest gesperrt. `demands` ist bereits
  // nach Relevanz absteigend sortiert.
  const isAnon = !loading && userId === null
  const publicTop = demands.slice(0, PUBLIC_PREVIEW_COUNT)
  const lockedRest = demands.slice(PUBLIC_PREVIEW_COUNT)

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bürgerforderungen</h1>
              <p className="text-gray-500 mt-1">Welche Themen bewegen Köln Innenstadt?</p>
            </div>
            <Link
              href={userId ? '/forderungen/neu' : '/login'}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0 w-full sm:w-auto"
            >
              <Plus size={15} />
              Einreichen
            </Link>
          </div>

          {/* Karte: Forderungen räumlich entdecken */}
          <ForderungenMapCard pins={mapPins} />

          {isAnon && demands.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-6">
              <p className="text-sm text-blue-800">
                Du siehst gerade die öffentliche Vorschau. Melde dich an, um <strong>alle Forderungen</strong> zu sehen und mitzumachen.
              </p>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
              >
                <LogIn size={15} />
                Anmelden
              </Link>
            </div>
          )}

          {!isAnon && categoriesWithDemands.length > 1 && (
            <div className="flex gap-2 overflow-x-auto mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
              >
                Alle
              </button>
              {categoriesWithDemands.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : demands.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-medium">Noch keine Forderungen</div>
              <div className="text-sm mt-1">Sei der Erste und reiche ein Anliegen ein.</div>
            </div>
          ) : isAnon ? (
            // Öffentliche Vorschau: Top-2 voll, Rest gesperrt
            <div className="flex flex-col gap-3">
              {publicTop.map(d => (
                <DemandCard
                  key={d.id}
                  demand={d}
                  areas={areasForDemand(d)}
                  position={positions[d.id]}
                  textCount={textCounts[d.id] ?? 0}
                  variant="list"
                  iconCategory={areasForDemand(d)[0]}
                  onOpen={openDemand}
                  onToggleSupport={toggleSupport}
                />
              ))}
              {lockedRest.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-4 mb-1">
                    <span className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400">
                      {lockedRest.length} weitere {lockedRest.length === 1 ? 'Forderung' : 'Forderungen'} — nach Anmeldung
                    </span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>
                  {lockedRest.map(d => (
                    <LockedDemandTeaser
                      key={d.id}
                      title={d.title}
                      relevanceScore={d.relevance_score}
                      onClick={() => router.push('/login')}
                    />
                  ))}
                </>
              )}
            </div>
          ) : activeCategory ? (
            // Fokus-Ansicht einer Kategorie: alle Forderungen als Liste
            <>
              <p className="text-sm text-gray-500 mb-4">
                {focusDemands.length} {focusDemands.length === 1 ? 'Forderung' : 'Forderungen'} in {activeCategory}
              </p>
              <div className="flex flex-col gap-3">
                {focusDemands.map(d => (
                  <DemandCard
                    key={d.id}
                    demand={d}
                    areas={areasForDemand(d)}
                    position={positions[d.id]}
                    textCount={textCounts[d.id] ?? 0}
                    variant="list"
                    iconCategory={activeCategory}
                    onOpen={openDemand}
                    onToggleSupport={toggleSupport}
                  />
                ))}
              </div>
            </>
          ) : (
            // "Alle": nach Themenbereichen gegliedert, je Bereich eine horizontal
            // wischbare Reihe mit "Alle anzeigen".
            <div className="flex flex-col">
              {categoriesWithDemands.map(cat => {
                const rowDemands = demands.filter(d => areasForDemand(d).includes(cat))
                return (
                  <section key={cat} className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">{cat}</h2>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center gap-0.5 text-sm font-medium text-blue-600 hover:text-blue-700 shrink-0"
                      >
                        Alle anzeigen <ChevronRight size={15} />
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {rowDemands.slice(0, ROW_LIMIT).map(d => (
                        <DemandCard
                          key={d.id}
                          demand={d}
                          areas={areasForDemand(d)}
                          position={positions[d.id]}
                          textCount={textCounts[d.id] ?? 0}
                          variant="row"
                          iconCategory={cat}
                          onOpen={openDemand}
                          onToggleSupport={toggleSupport}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
