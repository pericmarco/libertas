// Zugriffspunkt für die aktive Produktlinien-Konfiguration.
//
//   import { tenant, t } from '@/lib/tenant'
//   <h1>{t('demandPlural')}</h1>   // "Forderungen" (City) / "Anliegen" (Campus)
//   {tenant.modules.politiker && <PolitikerLink />}
//
// Solange NEXT_PUBLIC_PRODUCT_LINE nicht auf 'campus' steht, liefert dies
// die City-Config → Köln bleibt unverändert.

import { activeProductLine, type LabelKey, type TenantConfig } from './config'
import { cityConfig } from './city'
import { campusConfig } from './campus'

export const tenant: TenantConfig =
  activeProductLine() === 'campus' ? campusConfig : cityConfig

/** Kurzhelfer für ein Label der aktiven Produktlinie. */
export function t(key: LabelKey): string {
  return tenant.labels[key]
}

export type { TenantConfig, LabelKey, ProductLine, ModuleKey, RoleDef } from './config'
