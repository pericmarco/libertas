import Navbar from '@/components/layout/Navbar'
import FeedList from '@/components/feed/FeedList'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { areasForDemand, type FeedItem } from '@/lib/feed'
import Link from 'next/link'
import { LogIn, Sparkles, Vote, CalendarClock } from 'lucide-react'

// Datums-Logik gekapselt in Modul-Funktionen (nicht im Render-Body).
function startOfTodayIso(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString()
}

// „Heute in deiner Stadt" — echte Signale aus den geladenen Daten.
function todayHighlights(
  demands: { created_at: string | null }[],
  votes: { ends_at: string | null; title: string }[],
  events: { starts_at: string; title: string }[],
) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const now = Date.now()
  const neueHeute = demands.filter(d => (d.created_at ?? '').slice(0, 10) === todayStr).length
  const aktiveUmfragen = votes.filter(v => !v.ends_at || new Date(v.ends_at).getTime() > now).length
  const baldFrist = votes
    .filter(v => v.ends_at && new Date(v.ends_at).getTime() > now)
    .map(v => ({ title: v.title, days: Math.ceil((new Date(v.ends_at as string).getTime() - now) / 86_400_000) }))
    .filter(v => v.days <= 5)
    .sort((a, b) => a.days - b.days)[0]
  const eventToday = events
    .filter(e => (e.starts_at ?? '').slice(0, 10) === todayStr)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0]
  return {
    neueHeute, aktiveUmfragen, baldFrist, eventToday,
    hatHighlights: neueHeute > 0 || aktiveUmfragen > 0 || !!baldFrist || !!eventToday,
  }
}

export default async function Feed() {
  const supabase = await createClient()
  const city = await getCurrentCity()

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id ?? null

  const { data: districts } = await supabase
    .from('districts')
    .select('id, name')
    .eq('city_id', city.id)
    .not('region_id', 'is', null)
  const districtIds = (districts ?? []).map(d => d.id)
  const districtName = (id: string | null) => (id ? districts?.find(d => d.id === id)?.name ?? null : null)

  const [{ data: profile }, { data: demandsData }, { data: argsData }, { data: votesData }, { data: newsData }] =
    await Promise.all([
      uid ? supabase.from('profiles').select('district_id').eq('id', uid).single() : Promise.resolve({ data: null }),
      supabase.from('demands')
        .select('id, title, description, category, tags, status, location, relevance_score, created_at')
        .eq('city_id', city.id)
        .neq('status', 'zurückgezogen')
        .or('submission_type.is.null,submission_type.neq.mangel')
        .order('created_at', { ascending: false })
        .limit(60),
      supabase.from('demand_arguments').select('demand_id, type, text'),
      supabase.from('votes')
        .select('id, title, description, ends_at, total_votes, partner_name, target_district_id, created_at, is_partner_vote')
        .eq('city_id', city.id)
        .eq('is_partner_vote', true)
        .order('created_at', { ascending: false })
        .limit(20),
      districtIds.length
        ? supabase.from('news').select('id, title, summary, category, source, source_url, published_at, district_id')
            .in('district_id', districtIds).order('published_at', { ascending: false }).limit(8)
        : Promise.resolve({ data: [] as never[] }),
    ])

  // Veranstaltungen (ab heute) + Bilder der Forderungen. Beide best-effort und
  // getrennt von der Haupt-Abfrage: fehlt eine Tabelle/Spalte noch (Migration
  // nicht eingespielt), bleibt der Feed intakt — nur ohne Events/Thumbnails.
  const demandIds = (demandsData ?? []).map(d => d.id)
  const [{ data: eventsData }, { data: imgRows }, { data: vidRows }] = await Promise.all([
    supabase.from('events')
      .select('id, title, description, kind, starts_at, ends_at, location, online, organizer, district_id, created_at')
      .eq('city_id', city.id)
      .gte('starts_at', startOfTodayIso())
      .order('starts_at', { ascending: true })
      .limit(20),
    // Bilder und Videos getrennt: fehlt eine Spalte noch, bricht nur die eine
    // Zusatz-Abfrage — die andere (und der ganze Feed) bleibt intakt.
    demandIds.length
      ? supabase.from('demands').select('id, image_urls').in('id', demandIds)
      : Promise.resolve({ data: [] as { id: string; image_urls: string[] | null }[] }),
    demandIds.length
      ? supabase.from('demands').select('id, video_url').in('id', demandIds)
      : Promise.resolve({ data: [] as { id: string; video_url: string | null }[] }),
  ])
  const imgMap = new Map<string, string>()
  for (const r of imgRows ?? []) {
    const first = Array.isArray(r.image_urls) ? r.image_urls[0] : null
    if (first) imgMap.set(r.id, first)
  }
  const vidMap = new Map<string, string>()
  for (const r of vidRows ?? []) {
    if (r.video_url) vidMap.set(r.id, r.video_url)
  }

  const meinStadtteil = districtName(profile?.district_id ?? null)

  // Zähler je Forderung aus den Beiträgen aggregieren
  const counts = new Map<string, { supports: number; counters: number; alternatives: number; beitraege: number }>()
  for (const a of argsData ?? []) {
    const c = counts.get(a.demand_id) ?? { supports: 0, counters: 0, alternatives: 0, beitraege: 0 }
    if (a.type === 'unterstützend') c.supports++
    else if (a.type === 'gegenargument') c.counters++
    else if (a.type === 'alternative') c.alternatives++
    if (a.text && a.text.trim().length > 0) c.beitraege++
    counts.set(a.demand_id, c)
  }

  const items: FeedItem[] = []

  for (const d of demandsData ?? []) {
    const c = counts.get(d.id) ?? { supports: 0, counters: 0, alternatives: 0, beitraege: 0 }
    items.push({
      type: 'forderung',
      id: d.id,
      title: d.title,
      description: d.description,
      areas: areasForDemand(d),
      status: d.status,
      location: d.location,
      relevance: d.relevance_score ?? 0,
      supports: c.supports,
      counters: c.counters,
      alternatives: c.alternatives,
      beitraege: c.beitraege,
      image: imgMap.get(d.id) ?? null,
      video: vidMap.get(d.id) ?? null,
      createdAt: d.created_at,
    })
  }

  for (const v of votesData ?? []) {
    items.push({
      type: 'umfrage',
      id: v.id,
      title: v.title,
      description: v.description,
      sender: v.partner_name || `Stadt ${city.name}`,
      district: districtName(v.target_district_id ?? null),
      totalVotes: v.total_votes ?? 0,
      endsAt: v.ends_at,
      createdAt: v.created_at ?? v.ends_at ?? new Date(0).toISOString(),
    })
  }

  for (const e of eventsData ?? []) {
    items.push({
      type: 'event',
      id: e.id,
      title: e.title,
      description: e.description,
      kind: e.kind,
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      location: e.location,
      online: e.online ?? false,
      organizer: e.organizer,
      district: districtName(e.district_id ?? null),
      // Einsortierung nach Ankündigungszeitpunkt, nicht nach Termin — sonst
      // würden künftige Events den Feed dauerhaft nach oben drängen.
      createdAt: e.created_at ?? e.starts_at,
    })
  }

  for (const n of newsData ?? []) {
    items.push({
      type: 'info',
      id: n.id,
      title: n.title,
      summary: n.summary,
      category: n.category,
      source: n.source,
      sourceUrl: n.source_url,
      district: districtName(n.district_id ?? null),
      createdAt: n.published_at,
    })
  }

  items.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

  const { neueHeute, aktiveUmfragen, baldFrist, eventToday, hatHighlights } = todayHighlights(demandsData ?? [], votesData ?? [], eventsData ?? [])

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Was bei dir passiert</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {city.is_demo ? `Beispielansicht · ${city.name}` : `Aus ${city.name}${meinStadtteil ? ` und ${meinStadtteil}` : ''}`}
            </p>
          </div>

          {/* „Heute in deiner Stadt" — kompakter Tages-Überblick aus echten Signalen */}
          <section className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">Heute in {city.name}</div>
            {hatHighlights ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {eventToday && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700">
                    <CalendarClock size={14} /> Heute: {eventToday.title.length > 26 ? eventToday.title.slice(0, 26) + '…' : eventToday.title} · {new Date(eventToday.starts_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                  </span>
                )}
                {neueHeute > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                    <Sparkles size={14} /> {neueHeute} {neueHeute === 1 ? 'neuer Beitrag' : 'neue Beiträge'} heute
                  </span>
                )}
                {aktiveUmfragen > 0 && (
                  <Link href="/abstimmungen" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100">
                    <Vote size={14} /> {aktiveUmfragen} {aktiveUmfragen === 1 ? 'Abstimmung läuft' : 'Abstimmungen laufen'}
                  </Link>
                )}
                {baldFrist && (
                  <Link href="/abstimmungen" className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
                    <CalendarClock size={14} /> „{baldFrist.title.length > 28 ? baldFrist.title.slice(0, 28) + '…' : baldFrist.title}“ endet in {baldFrist.days} {baldFrist.days === 1 ? 'Tag' : 'Tagen'}
                  </Link>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-gray-500">Schau dich um, was deine Nachbarschaft gerade bewegt — und bring dich ein.</p>
            )}
          </section>

          {!uid && !city.is_demo && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-blue-800">
                Melde dich an, um deinen Stadtteil zu personalisieren, mitzudiskutieren und Beiträge zu erstellen.
              </p>
              <Link href="/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <LogIn size={15} /> Registrieren
              </Link>
            </div>
          )}

          <FeedList items={items} districtName={meinStadtteil} cityName={city.name} isDemo={city.is_demo} />
        </div>
      </main>
    </>
  )
}
