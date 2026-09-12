import Link from 'next/link'
import Image from 'next/image'
import { getCurrentCity } from '@/lib/city/server'
import { PROCESSES } from '@/lib/kommune/demo'
import ProcessCard from '@/components/kommune/ProcessCard'
import { Wrench, ArrowRight, Megaphone, BarChart3, Map as MapIcon, CalendarDays } from 'lucide-react'

// Kommunale Startseite (musterstadt.lybertas.de/). Öffentlich sichtbares
// „Schaufenster" des Beteiligungsportals.
export default async function MunicipalStart() {
  const city = await getCurrentCity()
  const brand = city.brand_name?.trim() || 'Musterstadt'

  const aktiv = PROCESSES.filter(p => p.status === 'beteiligung_laeuft')
  const weitere = PROCESSES.filter(p => p.status !== 'beteiligung_laeuft')

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      {/* Hero — Farbwelt aus dem Logo abgeleitet: Navy-Basis (seriös, kräftig),
          Logo-Blau als Glanz oben rechts, Logo-Grün als ruhiger Verlauf von
          unten links (der Hügel unter der Stadt im Logo). Weiße Schrift bleibt
          auf der dunklen Navy-Basis durchgehend gut lesbar. */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14 text-white"
        style={{
          backgroundColor: '#153860',
          backgroundImage: [
            'radial-gradient(120% 135% at 6% 118%, rgba(76,166,64,0.45) 0%, rgba(76,166,64,0.12) 34%, rgba(76,166,64,0) 62%)',
            'radial-gradient(95% 120% at 100% -10%, rgba(43,124,191,0.55) 0%, rgba(43,124,191,0) 58%)',
            'linear-gradient(135deg, #10305a 0%, #163f6c 46%, #1d5183 100%)',
          ].join(', '),
        }}
      >
        {/* Logo auf weißem „Badge" — die Logo-Marken sind Navy/Grün und würden
            auf dem dunklen Verlauf verschwinden; das Logo selbst bleibt unverändert. */}
        <span className="mb-6 inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
          <Image src="/muster/logo-musterstadt.png" alt={`${brand} · Beteiligungsportal`} width={230} height={45} priority className="h-9 w-auto sm:h-11" />
        </span>
        <h1 className="max-w-2xl text-3xl sm:text-4xl font-bold leading-tight">{brand} gemeinsam gestalten.</h1>
        <p className="mt-3 max-w-xl text-white/85 text-lg">Informieren. Mitreden. Ideen einbringen.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/beteiligungen" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#153860] shadow-sm transition-colors hover:bg-blue-50">
            Jetzt beteiligen <ArrowRight size={16} />
          </Link>
          <Link href="/maengel" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors hover:bg-white/20">
            <Wrench size={16} /> Mangel melden
          </Link>
        </div>
      </section>

      {/* Aktive Beteiligungen */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Aktuelle Beteiligungen</h2>
            <p className="text-sm text-gray-500">Bringen Sie sich jetzt in laufende Verfahren ein.</p>
          </div>
          <Link href="/beteiligungen" className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700">Alle anzeigen →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aktiv.map(p => <ProcessCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Weitere Verfahren */}
      {weitere.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Geplant & in Auswertung</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weitere.map(p => <ProcessCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}

      {/* Schnellzugriffe */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/veranstaltungen', icon: CalendarDays, tint: 'bg-blue-50 text-blue-600', title: 'Veranstaltungen', desc: 'Termine, Werkstätten und Infoabende.' },
          { href: '/vorhaben', icon: Megaphone, tint: 'bg-purple-50 text-purple-600', title: 'Vorhaben der Stadt', desc: 'Was die Verwaltung plant und umsetzt.' },
          { href: '/karte', icon: MapIcon, tint: 'bg-sky-50 text-sky-600', title: 'Beteiligungskarte', desc: 'Vorhaben, Ideen und Mängel im Stadtgebiet.' },
          { href: '/ergebnisse', icon: BarChart3, tint: 'bg-emerald-50 text-emerald-600', title: 'Ergebnisse', desc: 'Was aus Ihrer Beteiligung geworden ist.' },
        ].map(s => (
          <Link key={s.href} href={s.href} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tint}`}><s.icon size={20} strokeWidth={1.9} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-900">{s.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{s.desc}</span>
            </span>
            <ArrowRight size={17} className="shrink-0 text-gray-300" />
          </Link>
        ))}
      </section>

      <p className="mt-12 text-center text-xs text-gray-400">
        Beispielhaftes Beteiligungsportal · alle Inhalte sind fiktiv · bereitgestellt mit Lybertas
      </p>
    </main>
  )
}
