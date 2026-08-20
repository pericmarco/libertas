import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin, FileText, Users, Pencil, Newspaper, ExternalLink,
  Sparkles, Flame, TrendingUp, ShieldCheck, ArrowUpRight, Compass,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentCity } from '@/lib/city/server'
import { tenant, t } from '@/lib/tenant'
import ElectionsCard from '@/components/ElectionsCard'
import StadtteilCard from '@/components/StadtteilCard'
import PolitischeVertretung from '@/components/PolitischeVertretung'
import { dashboardTimeContext } from '@/lib/now'
import Link from 'next/link'

// Ab wie vielen Relevanzpunkten eine Forderung die Bürgerpriorisierung
// erreicht (muss mit components/DemandCard übereinstimmen).
const RELEVANCE_THRESHOLD = 50

const STATUS_LABEL: Record<string, string> = {
  eingereicht: 'Eingereicht', geprüft: 'Geprüft', bearbeitet: 'In Bearbeitung',
  umgesetzt: 'Umgesetzt', abgelehnt: 'Abgelehnt',
}
// Wie eine offizielle Antwort im Feed klingt (Wert ↔ Formulierung)
const RESPONSE_VERB: Record<string, string> = {
  unterstuetzung: 'unterstützt deine Forderung',
  gegenargument: 'sieht deine Forderung kritisch',
  alternative: 'schlägt eine Alternative vor',
}

export default async function Dashboard() {
  const supabase = await createClient()

  // Alles auf dieser Seite zeigt ausschließlich Inhalte der aufgerufenen Stadt.
  const city = await getCurrentCity()

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id ?? null

  const { data: districts } = await supabase
    .from('districts')
    .select('id, name')
    .eq('city_id', city.id)

  const districtIds = districts?.map(d => d.id) ?? []

  // Für die „diese Woche"-Kennzahlen und die tageszeit-abhängige Begrüßung
  const { weekAgo, greeting } = dashboardTimeContext()

  const [
    { data: topics },
    { data: news },
    { data: elections },
    { data: profile },
    { count: demandsGesamt },
    { count: unterstuetzt },
    { count: eingereicht },
    { count: demandsWeek },
    { count: unterstuetztWeek },
    { count: eingereichtWeek },
  ] = await Promise.all([
    supabase.from('topics').select('*').eq('city_id', city.id).order('created_at', { ascending: false }),
    supabase.from('news').select('*').in('district_id', districtIds).order('published_at', { ascending: false }).limit(4),
    supabase.from('elections').select('id, title, election_date, expected_year, description').eq('city_id', city.id),
    uid ? supabase.from('profiles').select('full_name, username, district_id').eq('id', uid).single() : Promise.resolve({ data: null }),
    supabase.from('demands').select('id', { count: 'exact', head: true }).eq('city_id', city.id),
    uid ? supabase.from('demand_arguments').select('demand_id', { count: 'exact', head: true }).eq('user_id', uid).eq('type', 'unterstützend') : Promise.resolve({ count: 0 }),
    uid ? supabase.from('demands').select('id', { count: 'exact', head: true }).eq('user_id', uid) : Promise.resolve({ count: 0 }),
    supabase.from('demands').select('id', { count: 'exact', head: true }).eq('city_id', city.id).gte('created_at', weekAgo),
    uid ? supabase.from('demand_arguments').select('demand_id', { count: 'exact', head: true }).eq('user_id', uid).eq('type', 'unterstützend').gte('created_at', weekAgo) : Promise.resolve({ count: 0 }),
    uid ? supabase.from('demands').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', weekAgo) : Promise.resolve({ count: 0 }),
  ])

  const meinStadtteil = districts?.find(d => d.id === profile?.district_id)?.name ?? null
  const firstName = profile?.full_name?.trim()?.split(/\s+/)[0] || profile?.username || null

  // ── Persönlicher Beteiligungs-Feed ────────────────────────────
  // Zeigt „was sich bei DIR getan hat" (Status/Antworten/Schwellenwert) —
  // bewusst KEINE Browse-Liste (das ist die Forderungen-Seite). Alle
  // Abfragen defensiv: fehlt eine Tabelle/Spalte, bleibt der Feed leer.
  type FeedItem = { key: string; kind: 'response' | 'threshold' | 'status'; text: string; href: string; date: string }
  const feed: FeedItem[] = []
  if (uid) {
    const { data: myDemands } = await supabase.from('demands')
      .select('id, title, status, created_at')
      .eq('user_id', uid)
      .neq('status', 'zurückgezogen')
      .order('created_at', { ascending: false })
      .limit(30)
    const mine = myDemands ?? []
    const myIds = mine.map(d => d.id)
    const titleOf = (id: string) => mine.find(d => d.id === id)?.title ?? 'deine Forderung'

    // 1) Offizielle Antworten auf eigene Forderungen (neueste je Forderung)
    const responded = new Set<string>()
    if (myIds.length > 0) {
      const { data: resp } = await supabase.from('demand_responses')
        .select('demand_id, position, author, created_at')
        .in('demand_id', myIds)
        .order('created_at', { ascending: false })
      for (const r of resp ?? []) {
        if (responded.has(r.demand_id)) continue
        responded.add(r.demand_id)
        const who = r.author?.trim() || 'Stadt / Politik'
        feed.push({
          key: `resp-${r.demand_id}`,
          kind: 'response',
          text: `${who} ${RESPONSE_VERB[r.position] ?? 'hat geantwortet'}: „${titleOf(r.demand_id)}"`,
          href: `/forderungen/${r.demand_id}`,
          date: r.created_at,
        })
      }
    }

    // 2) Statuswechsel eigener Forderungen (die mit Antwort sind schon oben)
    for (const d of mine) {
      if (d.status === 'eingereicht' || responded.has(d.id)) continue
      feed.push({
        key: `stat-${d.id}`,
        kind: 'status',
        text: `Deine Forderung „${d.title}" ist jetzt: ${STATUS_LABEL[d.status] ?? d.status}`,
        href: `/forderungen/${d.id}`,
        date: d.created_at,
      })
    }

    // 3) Von dir unterstützte Forderungen, die den Schwellenwert erreicht haben.
    // Unterstützung wird je nach Pfad in demand_arguments oder demand_supports
    // geführt — beide defensiv einsammeln und vereinen.
    const [{ data: argSup }, { data: rowSup }] = await Promise.all([
      supabase.from('demand_arguments').select('demand_id').eq('user_id', uid).eq('type', 'unterstützend'),
      supabase.from('demand_supports').select('demand_id').eq('user_id', uid),
    ])
    const supportedIds = [...new Set([...(argSup ?? []), ...(rowSup ?? [])].map(r => r.demand_id))]
      .filter(id => id && !myIds.includes(id))
    if (supportedIds.length > 0) {
      const { data: crossed } = await supabase.from('demands')
        .select('id, title, relevance_score, created_at')
        .in('id', supportedIds)
        .gte('relevance_score', RELEVANCE_THRESHOLD)
        .neq('status', 'zurückgezogen')
        .order('relevance_score', { ascending: false })
        .limit(6)
      for (const d of crossed ?? []) {
        feed.push({
          key: `thr-${d.id}`,
          kind: 'threshold',
          text: `Eine von dir unterstützte Forderung hat den Schwellenwert erreicht: „${d.title}"`,
          href: `/forderungen/${d.id}`,
          date: d.created_at,
        })
      }
    }

    feed.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }
  const feedTop = feed.slice(0, 5)

  const stats = [
    { label: 'Insgesamt eingereicht', value: demandsGesamt ?? 0, delta: demandsWeek ?? 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Von dir unterstützt', value: unterstuetzt ?? 0, delta: unterstuetztWeek ?? 0, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Von dir eingereicht', value: eingereicht ?? 0, delta: eingereichtWeek ?? 0, icon: Pencil, color: 'text-purple-600 bg-purple-50' },
  ]

  // Stadtteil-Kennzahlen und Ratsverteilung tragen fest hinterlegte KÖLNER
  // Daten → nur in Köln. Diese Blöcke bilden am PC die rechte Cockpit-Spalte.
  const hasRightRail = tenant.productLine === 'city' && city.slug === 'koeln'

  const feedIcon = { response: ShieldCheck, threshold: Flame, status: TrendingUp } as const
  const feedIconStyle = {
    response: 'text-blue-600 bg-blue-50',
    threshold: 'text-orange-600 bg-orange-50',
    status: 'text-emerald-600 bg-emerald-50',
  } as const

  // ── wiederverwendbare Blöcke ──────────────────────────────────
  const feedBlock = uid ? (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles size={16} className="text-gray-400" /> Neuigkeiten zu deiner Beteiligung
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {feedTop.length > 0 ? feedTop.map((item, i) => {
          const Icon = feedIcon[item.kind]
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors ${i < feedTop.length - 1 ? 'border-b' : ''}`}
            >
              <span className={`p-2 rounded-lg shrink-0 ${feedIconStyle[item.kind]}`}><Icon size={15} /></span>
              <span className="flex-1 min-w-0 text-sm text-gray-700 leading-snug">{item.text}</span>
              <ArrowUpRight size={15} className="text-gray-300 shrink-0" />
            </Link>
          )
        }) : (
          <div className="px-6 py-6 text-sm text-gray-500 leading-relaxed">
            Hier erscheinen Neuigkeiten zu deiner Beteiligung — sobald deine {tenant.labels.demandPlural} beantwortet
            werden oder eine von dir unterstützte Forderung den Schwellenwert erreicht.{' '}
            <Link href="/forderungen" className="font-medium text-blue-600 hover:underline">Jetzt mitmachen</Link>
          </div>
        )}
      </CardContent>
    </Card>
  ) : null

  const newsCard = (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Newspaper size={16} className="text-gray-400" />
            {tenant.productLine === 'campus' ? t('newsTitle') : `Aktuelles aus ${city.name}`}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {news && news.length > 0 ? news.map((item, i) => {
          const date = new Date(item.published_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
          const categoryColors: Record<string, string> = {
            Verkehr: 'bg-blue-100 text-blue-700',
            Politik: 'bg-purple-100 text-purple-700',
            Veranstaltung: 'bg-green-100 text-green-700',
            Umwelt: 'bg-emerald-100 text-emerald-700',
          }
          return (
            <div key={item.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${i < news.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                  {item.summary && <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>}
                  {item.source && <div className="text-xs text-gray-400 mt-1.5">Quelle: {item.source}</div>}
                </div>
                {item.source_url && (
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 transition-colors shrink-0 mt-1">
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          )
        }) : (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Keine aktuellen News</div>
        )}
      </CardContent>
    </Card>
  )

  const themenCard = (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Aktuelle Themen</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {topics && topics.length > 0 ? topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">{topic.title}</div>
              <div className="text-sm text-gray-500">{topic.category}</div>
            </div>
            <Badge variant={topic.status === 'active' ? 'default' : 'secondary'}>
              {topic.status === 'active' ? 'Aktiv' : 'Ausstehend'}
            </Badge>
          </div>
        )) : (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Keine Themen vorhanden</div>
        )}
      </CardContent>
    </Card>
  )

  // Repräsentativitäts-/Veedel-Hinweis für die rechte Spalte
  const veedelNudge = hasRightRail && uid ? (
    meinStadtteil ? (
      <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <Compass size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm leading-relaxed text-blue-800">
          Dein Veedel ist <span className="font-semibold">{meinStadtteil}</span>. Deine Stimme zählt hier besonders:
          Lybertas gewichtet {tenant.labels.demandPlural} danach, wie repräsentativ die Teilnehmenden sind — je mehr
          unterschiedliche Menschen aus {meinStadtteil} mitmachen, desto mehr Gewicht bekommt euer Veedel.
        </p>
      </div>
    ) : (
      <Link
        href="/profil"
        className="mb-3 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:border-amber-300"
      >
        <Compass size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm leading-relaxed text-amber-800">
          Stell in deinem <span className="font-semibold underline">Profil</span> deinen Stadtteil ein, damit dein
          Veedel hier automatisch erscheint und deine Stimme dem richtigen Bezirk zugeordnet wird.
        </p>
      </Link>
    )
  ) : null

  const leftColumn = (
    <>
      {feedBlock}
      {tenant.productLine === 'city' && <ElectionsCard elections={elections ?? []} />}
      {newsCard}
      {themenCard}
    </>
  )

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} />
              <span>{city.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {uid ? (firstName ? `${greeting}, ${firstName}` : greeting) : `${city.name} im Überblick`}
            </h1>
            <p className="text-gray-500 mt-1">
              {tenant.productLine === 'campus'
                ? 'Neuigkeiten und Anliegen an deinem Campus'
                : (uid ? `Deine Beteiligung und was sich in ${city.name} bewegt` : `Aktuelle politische Themen in ${city.name}`)}
            </p>
          </div>

          {uid ? (
            <>
              {/* Deine Beteiligung */}
              <h2 className="font-semibold text-gray-900 mb-3">Deine Beteiligung</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stats.map(({ label, value, delta, icon: Icon, color }) => (
                  <Card key={label}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${color}`}>
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
                        <div className="text-sm text-gray-500">{label}</div>
                        {delta > 0 && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <ArrowUpRight size={12} /> +{delta} diese Woche
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* Gäste: statt persönlicher Beteiligung eine Registrieren-Einladung */
            <div className="bg-blue-600 rounded-2xl px-6 py-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {city.is_demo ? `Beispielansicht ${city.name}` : `Mach mit in ${city.name}`}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {city.is_demo
                    ? `So sieht die Plattform für Bürgerinnen und Bürger aus. Alle ${tenant.labels.demandPlural} und Zahlen hier sind Beispieldaten.`
                    : `Registriere dich kostenlos, um ${tenant.labels.demandPlural} einzureichen, abzustimmen und deine eigene Beteiligung zu sehen.`}
                </p>
              </div>
              {city.is_demo ? (
                <Link
                  href="/forderungen"
                  className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Beispiel-{tenant.labels.demandPlural} ansehen
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Kostenlos registrieren
                </Link>
              )}
            </div>
          )}

          {hasRightRail ? (
            /* PC-Cockpit: links Beteiligung/Wahlen/News, rechts dein Veedel +
               Ratsverteilung. Mobil stapelt alles einspaltig in dieser Reihenfolge. */
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
              <div>{leftColumn}</div>
              <div>
                {veedelNudge}
                <StadtteilCard defaultName={meinStadtteil} />
                <PolitischeVertretung />
              </div>
            </div>
          ) : (
            leftColumn
          )}

        </div>
      </main>
    </>
  )
}
