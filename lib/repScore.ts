import type { SupabaseClient } from '@supabase/supabase-js'
import { calcRepScore } from '@/lib/score'
import { REGION_NAME } from '@/lib/constants'

export const MIN_SCORE_PARTICIPANTS = 5

// Berechnet den Repräsentativitäts-Score für die Kohorte gegebener
// Nutzer-IDs (z. B. alle, die zu einer Forderung Stellung genommen oder
// an einer Umfrage teilgenommen haben).
export async function computeRepScoreForUsers(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<{ score: number; participants: number }> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return { score: 0, participants: 0 }

  const { data: region } = await supabase.from('regions').select('id').eq('name', REGION_NAME).single()

  const [{ data: profiles }, { data: demographics }, { data: districts }] = await Promise.all([
    supabase.from('profiles').select('age_group, gender, district_id').in('id', unique),
    supabase.from('district_demographics').select('category, label, percentage').eq('region_id', region?.id ?? ''),
    supabase.from('districts').select('id, name'),
  ])

  const districtMap = new Map((districts ?? []).map(d => [d.id, d.name as string]))
  const cohort = (profiles ?? []).map(p => ({
    age_group: p.age_group,
    gender: p.gender,
    stadtteil: p.district_id ? districtMap.get(p.district_id) ?? null : null,
  }))

  const score = calcRepScore(cohort, demographics ?? [])
  const participants = cohort.filter(p => p.age_group && p.gender && p.stadtteil).length
  return { score, participants }
}
