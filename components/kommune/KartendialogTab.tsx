'use client'

// Adapter: reicht die Musterstadt-Demo-Daten in das produktneutrale
// Kartendialog-Modul (components/participation/Kartendialog). Dieselbe
// Komponente nutzt künftig auch Network.
import Kartendialog, { type DialogCategory } from '@/components/participation/Kartendialog'
import { MAP_CONTRIB, MAP_CENTER, MAP_PROMPT, MAP_CATEGORY } from '@/lib/kommune/mapdialog'
import type { LngLat } from '@/components/MapView'

const DEFAULT_CENTER: LngLat = { lng: 6.83, lat: 51.10 }
const CATEGORIES: DialogCategory[] = (['vorschlag', 'problem', 'lob'] as const).map(k => ({ key: k, ...MAP_CATEGORY[k] }))

export default function KartendialogTab({ slug }: { slug: string }) {
  return (
    <Kartendialog
      center={MAP_CENTER[slug] ?? DEFAULT_CENTER}
      prompt={MAP_PROMPT[slug]}
      categories={CATEGORIES}
      initial={MAP_CONTRIB[slug] ?? []}
    />
  )
}
