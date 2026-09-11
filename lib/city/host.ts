// ─────────────────────────────────────────
// Host → Stadt: Aus der aufgerufenen Adresse ableiten, welche Stadt gemeint ist.
//
//   koeln.lybertas.de        → slug 'koeln'
//   musterstadt.lybertas.de  → slug 'musterstadt'
//   mitreden.koeln           → eigene Domain der Stadt
//   lybertas.de / localhost  → keine Stadt → Standardstadt
//
// Reine Funktion ohne Seiteneffekte, damit sie auf Server und Client gleich
// funktioniert.
// ─────────────────────────────────────────

export const BASE_DOMAIN = 'lybertas.de'

// Standardstadt, solange keine Subdomain gewählt ist (heutiges Verhalten).
export const DEFAULT_CITY_SLUG = 'koeln'

// Subdomains, die niemals eine Stadt bezeichnen.
const RESERVED = new Set(['www', 'app', 'api', 'admin', 'mail', 'staging', 'preview', 'dev'])

// ─────────────────────────────────────────
// Produktlinie pro Stadt (NICHT die globale tenant-Env!):
//   'network'   → das Lybertas-Netzwerk (Feed/Vision) — app.lybertas.de/Köln.
//   'municipal' → kommunales Beteiligungsportal (Route-Tree /kommune).
//
// Quelle der Wahrheit ist langfristig die DB-Spalte cities.product (Migration
// 032). Bis die eingespielt ist, greift diese Code-Fallback-Liste, damit die
// Demo sofort funktioniert. Netzstädte (koeln …) sind NIE in der Liste →
// app.lybertas.de bleibt garantiert 'network'.
// ─────────────────────────────────────────
export type Product = 'network' | 'municipal'

export const MUNICIPAL_SLUGS = new Set<string>(['musterstadt'])

export function productForSlug(slug: string | null | undefined): Product {
  return slug && MUNICIPAL_SLUGS.has(slug) ? 'municipal' : 'network'
}

export type City = {
  id: string
  slug: string
  name: string
  brand_name: string | null
  logo_url: string | null
  primary_color: string
  show_powered_by: boolean
  /** Vertriebs-Demo: keine Anmeldung, dauerhafter Beispiel-Hinweis. */
  is_demo: boolean
  /** Produktlinie dieser Stadt — steuert Layout/Navigation/Route-Tree. */
  product: Product
}

/** Nutzt diese Stadt die kommunale Beteiligungs-Erfahrung? */
export function isMunicipal(city: City): boolean {
  return city.product === 'municipal'
}

// Notnagel, damit die Oberfläche nie ohne Branding dasteht.
export const FALLBACK_CITY: City = {
  id: '',
  slug: DEFAULT_CITY_SLUG,
  name: 'Köln',
  brand_name: null,
  logo_url: null,
  primary_color: '#2563EB',
  show_powered_by: true,
  is_demo: false,
  product: 'network',
}

export type HostInfo = { slug: string | null; customDomain: string | null }

export function parseHost(host: string | null | undefined): HostInfo {
  const none: HostInfo = { slug: null, customDomain: null }
  if (!host) return none

  let clean = host.split(':')[0].toLowerCase().trim()   // Port abschneiden
  if (clean.startsWith('www.')) clean = clean.slice(4)
  if (!clean) return none

  // Lokale Entwicklung und IP-Adressen: keine Stadt
  if (clean === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) return none

  // koeln.localhost:3000 — praktisch zum lokalen Testen mehrerer Städte
  if (clean.endsWith('.localhost')) {
    const sub = clean.slice(0, -'.localhost'.length)
    return sub && !sub.includes('.') && !RESERVED.has(sub)
      ? { slug: sub, customDomain: null }
      : none
  }

  // Vercel-Vorschau-Deployments: keine Stadt
  if (clean.endsWith('.vercel.app')) return none

  // Unsere eigene Domain
  if (clean === BASE_DOMAIN) return none
  if (clean.endsWith('.' + BASE_DOMAIN)) {
    const sub = clean.slice(0, -(BASE_DOMAIN.length + 1))
    return sub && !sub.includes('.') && !RESERVED.has(sub)
      ? { slug: sub, customDomain: null }
      : none
  }

  // Alles andere ist die eigene Domain einer Stadt (z. B. mitreden.koeln)
  return { slug: null, customDomain: clean }
}

/** Anzeigename: die Stadt-Marke, sonst Lybertas. */
export function brandName(city: City): string {
  return city.brand_name?.trim() || 'Lybertas'
}
