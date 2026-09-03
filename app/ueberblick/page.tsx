import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { Users, LayoutDashboard, TrendingUp, ChevronRight } from 'lucide-react'

// „Überblick" bündelt künftig Politik/Parteien und das Dashboard. Erste Stufe:
// klare Einstiege in die bestehenden, voll funktionsfähigen Bereiche. Die
// vollständige Zusammenführung (Tabs/Unterbereiche) folgt.
export default async function Ueberblick() {
  const city = await getCurrentCity()

  const sections = [
    { href: '/politiker', icon: Users, tint: 'bg-purple-50 text-purple-600', title: 'Politik & Parteien', desc: 'Parteien, politische Akteure, Profile und Zuständigkeiten.' },
    { href: '/dashboard', icon: LayoutDashboard, tint: 'bg-blue-50 text-blue-600', title: `${city.name} auf einen Blick`, desc: 'Kennzahlen, Sitzverteilung, Wahlen, Stadtteil-Daten und Neuigkeiten.' },
    { href: '/wirkung', icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-600', title: 'Wirkung', desc: 'Was aus Beteiligung geworden ist — Reaktionen und Umsetzungen.' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Überblick</h1>
            <p className="mt-0.5 text-sm text-gray-500">Politik, Zahlen und Entwicklungen aus {city.name}</p>
          </div>

          <div className="flex flex-col gap-3">
            {sections.map(s => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tint}`}>
                  <s.icon size={20} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">{s.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-500">{s.desc}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
