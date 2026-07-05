'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Vote, Megaphone, Users, LogOut, TrendingUp, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const links = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/forderungen',  label: 'Forderungen',   icon: Megaphone },
  { href: '/abstimmungen', label: 'Priorisierung', icon: Vote },
  { href: '/politiker',    label: 'Politiker',     icon: Users },
  { href: '/wirkung',      label: 'Wirkung',       icon: TrendingUp },
  { href: '/profil',       label: 'Profil',        icon: UserIcon },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-gray-900">Lybertas</span>
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

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Abmelden</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Anmelden
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
        <div className="grid grid-cols-6 h-16">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                pathname === href
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-700'
              )}
            >
              <Icon size={20} strokeWidth={pathname === href ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium max-w-full truncate px-0.5">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom padding so content isn't hidden behind nav */}
      <div className="md:hidden h-16" />
    </>
  )
}
