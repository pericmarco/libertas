import type { SupabaseClient } from '@supabase/supabase-js'
import { calcRepScore } from '@/lib/score'
import { REGION_NAME } from '@/lib/constants'

export const MIN_SCORE_PARTICIPANTS = 5

type DemographicRow = { age_group: string | null; gender: string | null; district_id: string | null }

// Kernberechnung: nimmt Demografie-Zeilen (Alter/Geschlecht/Bezirk) und
// vergleicht die Verteilung mit den Zielwerten von Köln Innenstadt.
export async function computeRepScoreForProfiles(
  supabase: SupabaseClient,
  rows: DemographicRow[]
): Promise<{ score: number; participants: number }> {
  if (rows.length === 0) return { score: 0, participants: 0 }

  const { data: region } = await supabase.from('regions').select('id').eq('name', REGION_NAME).single()

  const [{ data: demographics }, { data: districts }] = await Promise.all([
    supabase.from('district_demographics').select('category, label, percentage').eq('region_id', region?.id ?? ''),
    supabase.from('districts').select('id, name'),
  ])

  const districtMap = new Map((districts ?? []).map(d => [d.id, d.name as string]))
  const cohort = rows.map(p => ({
    age_group: p.age_group,
    gender: p.gender,
    stadtteil: p.district_id ? districtMap.get(p.district_id) ?? null : null,
  }))

  const score = calcRepScore(cohort, demographics ?? [])
  const participants = cohort.filter(p => p.age_group && p.gender && p.stadtteil).length
  return { score, participants }
}

// Für eine Kohorte von Nutzer-IDs (z. B. alle, die zu einer Forderung
// Stellung genommen haben) — lädt deren Profile und berechnet den Score.
export async function computeRepScoreForUsers(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<{ score: number; participants: number }> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return { score: 0, participants: 0 }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('age_group, gender, district_id')
    .in('id', unique)

  return computeRepScoreForProfiles(supabase, profiles ?? [])
}
