import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { brandName } from '@/lib/city/host'
import Image from 'next/image'
import { Megaphone, Vote, BarChart2, ChevronRight, MapPin, CheckCircle, Info } from 'lucide-react'

export default async function Home() {
  const city = await getCurrentCity()
  const brand = brandName(city)

  return (
    <main className="min-h-screen bg-white">

      {/* Demo-Instanz: dauerhafter Hinweis für Kommunen und Mandatsträger:innen,
          die sich das Produkt ansehen. */}
      {city.is_demo && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-50 border-b border-amber-200 px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center text-sm text-amber-900">
            <Info size={15} className="shrink-0" />
            <span>
              <strong>Beispielstadt.</strong> So könnte die Beteiligungsplattform Ihrer Kommune aussehen —
              alle Inhalte hier sind frei erfunden.
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <header className={`fixed left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 ${city.is_demo ? 'top-11' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt={`${brand} Logo`} width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">{brand}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/forderungen" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Ansehen
            </Link>
            {city.is_demo ? (
              /* Demo: kein Konto, direkter Weg in die Plattform */
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Plattform ansehen
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Anmelden
                </Link>
                <Link href="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`pb-24 px-6 ${city.is_demo ? 'pt-44' : 'pt-32'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-8">
            <MapPin size={14} />
            {city.name} · Pilotprojekt 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Deine Stimme zählt.<br />
            <span className="text-blue-600">Wirklich.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            {brand} bringt Demokratie in deinen Alltag. Reiche Forderungen ein, unterstütze Anliegen deiner Nachbarn und stimme über lokale Themen ab — direkt in deinem Stadtteil.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={city.is_demo ? '/dashboard' : '/register'}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              {city.is_demo ? 'Plattform ansehen' : 'Jetzt mitmachen'}
              <ChevronRight size={18} />
            </Link>
            <Link href="/forderungen" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-lg">
              {city.is_demo ? 'Beispiel-Anliegen ansehen' : 'Ohne Anmeldung ansehen'}
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            {city.is_demo
              ? 'Sie können sich frei umsehen — in dieser Beispielansicht ist kein Konto nötig.'
              : 'Schau dich erst um — Forderungen und Stadtumfragen sind auch ohne Konto einsehbar.'}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm font-medium text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-400" /> Transparenz</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-400" /> Beteiligung</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-400" /> Vertrauen</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Was du bei {brand} tun kannst</h2>
            <p className="text-gray-500">Drei einfache Wege um wirklich mitzumachen</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/forderungen" className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-5">
                <Megaphone size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Forderungen einreichen</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Du siehst ein Problem in deinem Stadtteil? Reiche eine Forderung ein. Wenn genug Nachbarn sie unterstützen, wird sie zur offiziellen Abstimmung.
              </p>
              <span className="inline-flex items-center gap-0.5 text-sm font-medium text-blue-600 mt-4">
                Forderungen ansehen <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <Link href="/abstimmungen" className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                <Vote size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Abstimmen</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Stimme über lokale Themen ab. Deine Stimme trägt zum Repräsentations-Score bei — so sehen Politiker wie ernst sie die Ergebnisse nehmen müssen.
              </p>
              <span className="inline-flex items-center gap-0.5 text-sm font-medium text-blue-600 mt-4">
                Stadtumfragen ansehen <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-5">
                <BarChart2 size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Repräsentations-Score</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Unser Score zeigt wie gut die Abstimmenden die echte Bevölkerung widerspiegeln. Je höher der Score, desto schwerer können Ergebnisse ignoriert werden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wie es funktioniert */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Wie funktioniert das?</h2>
            <p className="text-gray-500">In drei Schritten vom Anliegen zur Abstimmung</p>
          </div>

          <div className="flex flex-col gap-6">
            {[
              { step: '1', title: 'Registrieren', text: 'Erstelle ein kostenloses Konto mit deiner E-Mail. Keine App nötig — alles läuft im Browser.' },
              { step: '2', title: 'Forderung einreichen oder unterstützen', text: 'Reiche ein eigenes Anliegen ein oder unterstütze bestehende Forderungen deiner Nachbarn mit einem Klick.' },
              { step: '3', title: 'Abstimmung und Ergebnis', text: 'Forderungen mit genug Unterstützung werden zur Abstimmung. Das Ergebnis ist öffentlich und für Politiker sichtbar.' },
            ].map(({ step, title, text }) => (
              <div key={step} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  {step}
                </div>
                <div className="pt-1">
                  <div className="font-semibold text-gray-900 mb-1">{title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss-Aufruf — in der Demo an Kommunen gerichtet statt an Bürger:innen */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {city.is_demo ? 'Interesse für Ihre Kommune?' : 'Mach mit beim Pilotprojekt'}
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            {city.is_demo
              ? 'Diese Beispielstadt zeigt, wie Ihre Beteiligungsplattform aussehen könnte — unter Ihrem Namen, in Ihren Farben, mit Ihren Stadtteilen. Sprechen Sie uns gerne an.'
              : `${brand} startet jetzt in ${city.name}. Sei dabei und hilf dabei lokale Demokratie neu zu gestalten.`}
          </p>
          <Link
            href={city.is_demo ? 'mailto:info@lybertas.de' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            {city.is_demo ? 'Kontakt aufnehmen' : 'Kostenlos registrieren'}
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt={`${brand} Logo`} width={24} height={24} className="w-6 h-6" unoptimized />
            <span>{brand} · {city.name} 2026</span>
            {/* Bei eigener Stadt-Marke zeigen, wer die Plattform stellt —
                abschaltbar über cities.show_powered_by. */}
            {city.show_powered_by && brand !== 'Lybertas' && (
              <span className="text-gray-300">· powered by Lybertas</span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {!city.is_demo && (
              <>
                <Link href="/login" className="hover:text-gray-600 transition-colors">Anmelden</Link>
                <Link href="/register" className="hover:text-gray-600 transition-colors">Registrieren</Link>
              </>
            )}
            <Link href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
