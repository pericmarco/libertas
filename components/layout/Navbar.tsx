'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Vote, Megaphone, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/abstimmungen', label: 'Abstimmungen', icon: Vote },
  { href: '/forderungen',  label: 'Forderungen',  icon: Megaphone },
  { href: '/politiker',    label: 'Politiker',    icon: Users },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-gray-900">Libertas</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Anmelden
        </Link>
      </div>
    </header>
  )
}
