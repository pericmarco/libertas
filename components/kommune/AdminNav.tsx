'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCityBrand } from '@/lib/city/context'
import {
  LayoutDashboard, MessagesSquare, Building2, MessageSquare, Wrench,
  Calendar, BarChart3, Settings, ArrowUpRight,
} from 'lucide-react'

// Verwaltungs-Navigation des Kommunalportals. Eigene Chrome (kein Bürger-Menü).
const NAV = [
  { href: '/admin', label: 'Übersicht', icon: LayoutDashboard },
  { href: '/admin/beteiligungen', label: 'Beteiligungen', icon: MessagesSquare },
  { href: '/admin/vorhaben', label: 'Vorhaben', icon: Building2 },
  { href: '/admin/beitraege', label: 'Beiträge', icon: MessageSquare },
  { href: '/admin/maengel', label: 'Mängel', icon: Wrench },
  { href: '/admin/veranstaltungen', label: 'Veranstaltungen', icon: Calendar },
  { href: '/admin/auswertung', label: 'Auswertung', icon: BarChart3 },
  { href: '/admin/einstellungen', label: 'Einstellungen', icon: Settings },
]

export default function AdminNav() {
  const brand = useCityBrand()
  const pathname = usePathname()
  const isActive = (href: string) => {
    const target = '/kommune' + href
    return href === '/admin' ? pathname === target : pathname === target || pathname.startsWith(target + '/')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">V</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{brand}</span>
              <span className="block text-[10px] text-gray-400 -mt-0.5">Verwaltung</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
            Portal ansehen <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
      <nav className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href) ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white',
              )}
            >
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
