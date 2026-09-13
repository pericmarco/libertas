import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { Users, CalendarDays, Compass, TrendingUp, LayoutDashboard, ArrowUpRight, type LucideIcon } from 'lucide-react'

type Tile = { href: string; icon: LucideIcon; color: string; title: string; subtitle: string }

// „Stadt" ist ein App-artiger Auswahl-Hub: keine Inhalte direkt, sondern große
// Kacheln, über die man in den jeweiligen Bereich springt (mobile-first).
export default async function Stadt() {
  const city = await getCurrentCity()

  const tiles: Tile[] = [
    { href: '/politiker', icon: Users, color: '#7C3AED', title: 'Parteien & Akteure', subtitle: 'Profile, Zuständigkeiten & Reaktionsquoten' },
    { href: '/events', icon: CalendarDays, color: '#2563EB', title: 'Events', subtitle: 'Was in deiner Stadt ansteht' },
    { href: '/politik-kompass', icon: Compass, color: '#059669', title: 'Politik-Kompass', subtitle: 'Sitzverteilung, Wahlen & wer regiert' },
    { href: '/wirkung', icon: TrendingUp, color: '#16A34A', title: 'Wirkung', subtitle: 'Was aus Beteiligung geworden ist' },
    { href: '/dashboard', icon: LayoutDashboard, color: '#4F46E5', title: 'Meine Beteiligung', subtitle: 'Deine Anliegen, dein Status' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Stadt</h1>
            <p className="mt-0.5 text-sm text-gray-500">Wähle einen Bereich in {city.name}.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {tiles.map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.35)]"
              >
                {/* zarter Farbschimmer in der Ecke — dezent, aber „App-Feeling" */}
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.06] transition-opacity group-hover:opacity-[0.12]" style={{ backgroundColor: t.color }} />
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: t.color }}>
                  <t.icon size={22} strokeWidth={2} />
                </span>
                <span className="relative">
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    {t.title}
                    <ArrowUpRight size={15} className="text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gray-400" />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{t.subtitle}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
