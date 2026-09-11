'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCity, useCityBrand } from '@/lib/city/context'
import { Wrench } from 'lucide-react'

// Navigation des kommunalen Beteiligungsportals (musterstadt.lybertas.de).
// Bewusst getrennt von der Netzwerk-Navbar (components/layout/Navbar) — hier
// eine amtlich-klare Portal-Leiste im Lybertas-Design, kein Social-Feed.
// Links verwenden die sauberen öffentlichen Pfade; die Middleware bildet sie
// intern auf /kommune/* ab.
const NAV = [
  { href: '/', label: 'Start' },
  { href: '/beteiligungen', label: 'Beteiligungen' },
  { href: '/vorhaben', label: 'Vorhaben' },
  { href: '/karte', label: 'Karte' },
  { href: '/maengel', label: 'Mängel melden' },
  { href: '/ergebnisse', label: 'Ergebnisse' },
]

export default function MunicipalNav() {
  const brand = useCityBrand()
  const city = useCity()
  const pathname = usePathname()

  // Aktiv-Erkennung auf den intern umgeschriebenen Pfaden (/kommune/…).
  const isActive = (href: string) => {
    const target = '/kommune' + (href === '/' ? '' : href)
    return href === '/' ? pathname === '/kommune' || pathname === '/kommune/' : pathname === target || pathname.startsWith(target + '/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {city.is_demo && (
        <div className="bg-amber-50 text-amber-800 text-center text-[11px] font-medium py-1 px-4 border-b border-amber-100">
          Beispielportal · So könnte das Beteiligungsportal Ihrer Kommune mit Lybertas aussehen
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" priority unoptimized />
            <span className="leading-tight">
              <span className="block font-semibold text-gray-900">{brand}</span>
              <span className="block text-[11px] text-gray-400 -mt-0.5">Beteiligungsportal</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/maengel"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Wrench size={15} /> Mangel melden
          </Link>
        </div>

        {/* Mobile: horizontal scrollbare Portal-Navigation */}
        <nav className="md:hidden -mx-4 flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
