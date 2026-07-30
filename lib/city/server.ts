import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { parseHost, DEFAULT_CITY_SLUG, FALLBACK_CITY, type City } from './host'

// Aktive Stadt für die laufende Anfrage — serverseitig aus dem Host aufgelöst.
//
// Bewusst über die Datenbank (city_by_host) statt über eine Umgebungsvariable:
// Eine Env-Variable ist pro Deployment fest, wir brauchen aber pro ANFRAGE eine
// andere Stadt. Nur so lassen sich viele Städte aus einem Vercel-Projekt
// bedienen — und eine neue Stadt ist ein Datensatz statt eines Deployments.
export async function getCurrentCity(): Promise<City> {
  try {
    const h = await headers()
    const { slug, customDomain } = parseHost(h.get('host'))

    // Bei eigener Domain NICHT zusätzlich nach dem Standard-Slug suchen —
    // sonst würde eine unbekannte Domain fälschlich die Standardstadt treffen.
    const lookupSlug = customDomain ? null : (slug ?? DEFAULT_CITY_SLUG)

    const supabase = await createClient()
    const { data } = await supabase.rpc('city_by_host', {
      p_slug: lookupSlug,
      p_domain: customDomain,
    })

    const row = (Array.isArray(data) ? data[0] : data) as City | undefined
    return row ?? FALLBACK_CITY
  } catch {
    // Nie wegen der Stadt-Auflösung die Seite abstürzen lassen.
    return FALLBACK_CITY
  }
}
