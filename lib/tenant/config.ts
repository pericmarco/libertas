// ─────────────────────────────────────────
// Produktlinien-Konfiguration ("ein Rezept, zwei Kapitel")
//
// Diese Schicht entscheidet, ob die App als LYBERTAS City (Kommune, z. B.
// Köln) oder LYBERTAS Campus (Hochschule, z. B. Fresenius Campus Köln)
// läuft — und leitet daraus Wording, aktive Module, Rollen und Branding ab.
//
// Ausgewählt über die Umgebungsvariable NEXT_PUBLIC_PRODUCT_LINE.
// Fehlt sie, gilt 'city' → das bestehende Köln-Verhalten bleibt unverändert.
//
// WICHTIG: Noch verbraucht der bestehende Code diese Config nicht. Sie ist
// das Fundament; das schrittweise Verdrahten der Seiten passiert später,
// sobald wir die Campus-Instanz gegentesten können. Köln bleibt bis dahin
// exakt wie es ist.
// ─────────────────────────────────────────

export type ProductLine = 'city' | 'campus'

// Bausteine, die pro Produkt an- oder abgeschaltet werden.
export type ModuleKey =
  | 'dashboard'
  | 'news'          // Neuigkeiten (bei Campus das Kern-Feature)
  | 'anliegen'      // Forderungen / Anliegen
  | 'umfragen'      // Stadt- / Hochschul-Umfragen
  | 'techProblem'   // Mängelmelder / technisches Problem
  | 'wichtigeLinks' // nur Campus
  | 'einheiten'     // Stadtteile / Fachbereiche (die Zuordnungs-Einheit)
  | 'politiker'     // nur City
  | 'ratsverteilung'// nur City
  | 'karte'         // Kartenansicht
  | 'wirkung'       // Repräsentativitäts-Wirkung (City)
  | 'profil'
  | 'admin'

// Begriffe, die sich zwischen den Produktlinien unterscheiden.
export type LabelKey =
  | 'appName'
  | 'orgName'        // Köln Innenstadt / Hochschule Fresenius · Campus Köln
  | 'demand'         // Forderung / Anliegen
  | 'demandPlural'   // Forderungen / Anliegen
  | 'person'         // Bürger / Studierende
  | 'unit'           // Stadtteil / Fachbereich
  | 'unitPlural'     // Stadtteile / Fachbereiche
  | 'authority'      // Politik / Hochschule (die offiziell antwortet)
  | 'authorityStelle'// Amt / Zuständige Stelle
  | 'survey'         // Stadtumfrage / Hochschul-Umfrage
  | 'defect'         // Mängelmeldung / Technisches Problem
  | 'newsTitle'      // Aktuelles aus … / Neuigkeiten der Hochschule
  | 'dashboardTitle' // Dein Dashboard / Dein Campus-Dashboard

export type RoleDef = {
  key: string       // Wert in profiles.role bzw. abgeleitet
  label: string     // Anzeige
  badge: string     // Tailwind-Klassen fürs Badge
  /** darf offiziell auf Anliegen antworten (wie Phase-A-Politiker) */
  canRespond?: boolean
}

export type TenantConfig = {
  productLine: ProductLine
  key: string                 // 'koeln' | 'fresenius-koeln'
  labels: Record<LabelKey, string>
  modules: Record<ModuleKey, boolean>
  roles: RoleDef[]
  brand: {
    primary: string           // Hauptfarbe (Hex)
    /** Kennzeichnung als Demo/Vorschlag — bei Campus true, damit die
     *  öffentliche Demo nicht wie die echte, offizielle Seite wirkt. */
    demoBanner?: string
  }
}

// Aktive Produktlinie aus der Umgebung (Default: city → Köln unverändert).
export function activeProductLine(): ProductLine {
  return process.env.NEXT_PUBLIC_PRODUCT_LINE === 'campus' ? 'campus' : 'city'
}
