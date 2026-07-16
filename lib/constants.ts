import { tenant } from '@/lib/tenant'

// Region/Organisation der aktiven Produktlinie. City → 'Köln Innenstadt',
// Campus → 'Hochschule Fresenius · Campus Köln'. Der Wert muss exakt zum
// regions.name-Eintrag in der jeweiligen Datenbank passen.
export const REGION_NAME = tenant.labels.orgName

export const AGE_GROUPS = ['unter 18', '18–24', '25–29', '30–34', '35–44', '45–54', '55–59', '60–64', '65+']

export const GENDERS = ['weiblich', 'männlich', 'divers', 'keine Angabe']

// 3–24 Zeichen, Buchstaben/Zahlen/Punkt/Unterstrich — muss zum CHECK-Constraint
// auf profiles.username passen (Migration 013)
export const USERNAME_REGEX = /^[A-Za-z0-9_.]{3,24}$/

export const BLOCKED_WORDS = [
  'idiot', 'idioten', 'depp', 'vollidiot', 'scheiß', 'scheiss',
  'wichser', 'arschloch', 'nazi', 'hitler', 'heil', 'kanake', 'nigger',
  'neger', 'judensau', 'behindi', 'mongo', 'verrecke', 'krepier', 'stirb',
]

export function containsBlocked(text: string) {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some(w => lower.includes(w))
}
