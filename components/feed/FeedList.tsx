'use client'

import { useMemo, useState } from 'react'
import FeedCard from '@/components/feed/FeedCard'
import type { FeedItem } from '@/lib/feed'

type Scope = 'fuerDich' | 'stadtteil' | 'stadt'

function matchesDistrict(item: FeedItem, district: string): boolean {
  if (item.type === 'forderung') return (item.location ?? '').toLowerCase().includes(district.toLowerCase())
  return (item.district ?? '').toLowerCase() === district.toLowerCase()
}

export default function FeedList({
  items,
  districtName,
  cityName,
  isDemo,
}: {
  items: FeedItem[]
  districtName: string | null
  cityName: string
  isDemo?: boolean
}) {
  const [scope, setScope] = useState<Scope>('fuerDich')

  const visible = useMemo(() => {
    if (scope === 'stadtteil' && districtName) return items.filter(i => matchesDistrict(i, districtName))
    return items // „Für dich" und „Ganz Köln" zeigen aktuell alle Inhalte der Stadt
  }, [items, scope, districtName])

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
    }`

  return (
    <>
      {/* Lokale Filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={() => setScope('fuerDich')} className={chip(scope === 'fuerDich')}>Für dich</button>
        {districtName && (
          <button onClick={() => setScope('stadtteil')} className={chip(scope === 'stadtteil')}>{districtName}</button>
        )}
        <button onClick={() => setScope('stadt')} className={chip(scope === 'stadt')}>Ganz {cityName}</button>
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col gap-4">
          {visible.map(item => <FeedCard key={`${item.type}-${item.id}`} item={item} isDemo={isDemo} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
          <div className="text-3xl mb-2">🗞️</div>
          <div className="font-medium text-gray-700">Hier ist gerade nichts los</div>
          <div className="mt-1 text-sm text-gray-500">
            {scope === 'stadtteil'
              ? `In ${districtName} gibt es aktuell keine Beiträge — schau dir „Ganz ${cityName}" an.`
              : 'Sobald Forderungen, Umfragen oder Neuigkeiten eingehen, erscheinen sie hier.'}
          </div>
        </div>
      )}
    </>
  )
}
