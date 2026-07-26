'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Vote, Megaphone, Users, LogOut, TrendingUp, User as UserIcon, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

import { tenant } from '@/lib/tenant'
import type { ModuleKey } from '@/lib/tenant'

// Navigation der aktiven Produktlinie — nach Modulen gefiltert, Labels je
// Produktlinie. City zeigt Politiker/Wirkung, Campus nicht (dafür anderes
// Wording: Anliegen / Umfragen).
const NAV: { href: string; module: ModuleKey; label: string; icon: typeof LayoutDashboard }[] = [
  { href: '/dashboard',    module: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forderungen',  module: 'anliegen',  label: tenant.labels.demandPlural, icon: Megaphone },
  { href: '/abstimmungen', module: 'umfragen',  label: tenant.productLine === 'campus' ? 'Umfragen' : 'Priorisierung', icon: Vote },
  { href: '/politiker',    module: 'politiker', label: 'Politiker', icon: Users },
  { href: '/wirkung',      module: 'wirkung',   label: 'Wirkung', icon: TrendingUp },
  { href: '/profil',       module: 'profil',    label: 'Profil', icon: UserIcon },
]
const baseLinks = NAV.filter(l => tenant.modules[l.module])

const adminLink = { href: '/admin', label: 'Admin', icon: ShieldCheck }

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
        setIsAdmin(profile?.role === 'admin')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Nicht angemeldete Besucher sehen nur die öffentlich zugänglichen Tabs —
  // sonst würden die übrigen Tabs sie nur zum Login umleiten (Sackgasse).
  const PUBLIC_NAV_HREFS = ['/dashboard', '/forderungen', '/abstimmungen', '/politiker']
  const links = user
    ? (isAdmin ? [...baseLinks, adminLink] : baseLinks)
    : baseLinks.filter(l => PUBLIC_NAV_HREFS.includes(l.href))

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
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Lybertas Logo" width={32} height={32} className="w-8 h-8" priority unoptimized />
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
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                pathname === href
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Icon size={20} strokeWidth={pathname === href ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium max-w-full truncate px-0.5">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Der Platz für die Bottom-Nav wird global in globals.css reserviert
          (main.pt-16 bekommt auf Mobile padding-bottom) — ein Spacer hier
          würde oben statt unten landen, da die Navbar vor <main> gerendert wird. */}
    </>
  )
}
