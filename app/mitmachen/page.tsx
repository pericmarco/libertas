import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { Megaphone, Vote, Wrench, Building2, Landmark, ChevronRight, type LucideIcon } from 'lucide-react'

// „Mitmachen" bündelt alle Beteiligungsformate an einem Ort. Ersetzt den
// früheren Einzelpunkt „Abstimmungen" — dieser lebt jetzt als eines von
// mehreren Formaten hier. Weitere Formate (Bürgerbudget, Vorhaben, komplette
// Verfahren) kommen mit der Stadt-Integration dazu.
function FormatCard({ href, icon: Icon, tint, title, desc }: { href: string; icon: LucideIcon; tint: string; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-gray-900">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-300" />
    </Link>
  )
}

export default async function Mitmachen() {
  const city = await getCurrentCity()

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mitmachen</h1>
            <p className="mt-0.5 text-sm text-gray-500">Bring dich ein und unterstütze, was andere in {city.name} bewegen.</p>
          </div>

          {/* Jetzt aktiv */}
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Jetzt aktiv</h2>
          <div className="flex flex-col gap-3">
            <FormatCard
              href="/beteiligungen"
              icon={Landmark}
              tint="bg-blue-50 text-blue-600"
              title="Beteiligungsverfahren"
              desc="Offizielle Verfahren der Stadt — informieren, auf der Karte mitreden, Ideen einbringen."
            />
            <FormatCard
              href="/forderungen"
              icon={Megaphone}
              tint="bg-blue-50 text-blue-600"
              title="Forderungen"
              desc="Anliegen unterstützen, Gegenargumente und Alternativen einbringen — eine Position pro Beitrag."
            />
            <FormatCard
              href="/abstimmungen"
              icon={Vote}
              tint="bg-emerald-50 text-emerald-600"
              title="Abstimmungen & Umfragen"
              desc="Meinungsbilder und Prioritäten setzen — Stadtumfragen und Bürgerabstimmungen."
            />
            <FormatCard
              href="/forderungen/neu"
              icon={Wrench}
              tint="bg-orange-50 text-orange-600"
              title="Mangel melden"
              desc="Einen konkreten Missstand vor Ort melden und den Stand verfolgen."
            />
          </div>

          {/* Kommt mit der Stadt-Integration */}
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wide text-gray-400">Sobald deine Stadt dabei ist</h2>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Building2 size={20} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">Bürgerbudget, Varianten & Vorhaben</div>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                  Weitere Beteiligungsmodule folgen Schritt für Schritt: Variantenvergleiche, Bürgerbudgets,
                  Dokumenten-Dialoge und mehr — dieselben Werkzeuge wie im kommunalen Portal, nur mitten in deinem Feed.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Etwas Eigenes einbringen? Nutze das <span className="font-semibold text-gray-500">+</span> in der Navigation.
          </p>
        </div>
      </main>
    </>
  )
}
