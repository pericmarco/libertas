import Link from 'next/link'
import Image from 'next/image'
import { Megaphone, Vote, BarChart2, ChevronRight, MapPin, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Lybertas Logo" width={32} height={32} className="w-8 h-8" priority unoptimized />
            <span className="font-semibold text-gray-900">Lybertas</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/forderungen" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Ansehen
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Anmelden
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Registrieren
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-8">
            <MapPin size={14} />
            Köln Innenstadt · Pilotprojekt 2026
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Deine Stimme zählt.<br />
            <span className="text-blue-600">Wirklich.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            Lybertas bringt Demokratie in deinen Alltag. Reiche Forderungen ein, unterstütze Anliegen deiner Nachbarn und stimme über lokale Themen ab — direkt in deinem Stadtteil.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
              Jetzt mitmachen
              <ChevronRight size={18} />
            </Link>
            <Link href="/forderungen" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-lg">
              Ohne Anmeldung ansehen
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Schau dich erst um — Forderungen und Stadtumfragen sind auch ohne Konto einsehbar.</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Was du bei Lybertas tun kannst</h2>
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

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Mach mit beim Pilotprojekt</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Lybertas startet jetzt in Köln Innenstadt. Sei dabei und hilf dabei lokale Demokratie neu zu gestalten.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg">
            Kostenlos registrieren
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Lybertas Logo" width={24} height={24} className="w-6 h-6" unoptimized />
            <span>Lybertas · Köln 2026</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Anmelden</Link>
            <Link href="/register" className="hover:text-gray-600 transition-colors">Registrieren</Link>
            <Link href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
