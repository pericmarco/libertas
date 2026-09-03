import Navbar from '@/components/layout/Navbar'
import FeedList from '@/components/feed/FeedList'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { areasForDemand, type FeedItem } from '@/lib/feed'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

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

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900">Was bei dir passiert</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {city.is_demo ? `Beispielansicht · ${city.name}` : `Aus ${city.name}${meinStadtteil ? ` und ${meinStadtteil}` : ''}`}
            </p>
          </div>

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
