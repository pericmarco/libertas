// LYBERTAS City — Konfiguration für Kommunen (aktive Instanz: Köln Innenstadt)
// Die Labels spiegeln exakt das heutige Köln-Wording, damit sich für Köln
// nichts ändert, sobald die Seiten auf diese Config umgestellt werden.

import type { TenantConfig } from './config'

export const cityConfig: TenantConfig = {
  productLine: 'city',
  key: 'koeln',
  labels: {
    appName: 'Lybertas',
    orgName: 'Köln Innenstadt',
    demand: 'Forderung',
    demandPlural: 'Forderungen',
    person: 'Bürger',
    unit: 'Stadtteil',
    unitPlural: 'Stadtteile',
    authority: 'Politik',
    authorityStelle: 'Zuständige Stelle',
    survey: 'Stadtumfrage',
    defect: 'Mängelmeldung',
    newsTitle: 'Aktuelles aus Köln Innenstadt',
    dashboardTitle: 'Dein Dashboard',
  },
  modules: {
    dashboard: true,
    news: true,
    anliegen: true,
    umfragen: true,
    techProblem: true,
    wichtigeLinks: false,
    einheiten: true,      // Stadtteile
    politiker: true,
    ratsverteilung: true,
    karte: true,
    wirkung: true,
    profil: true,
    admin: true,
  },
  roles: [
    { key: 'citizen',    label: 'Bürger',   badge: 'bg-gray-100 text-gray-600' },
    { key: 'city',       label: 'Stadt',    badge: 'bg-emerald-100 text-emerald-700', canRespond: true },
    { key: 'politician', label: 'Politik',  badge: 'bg-purple-100 text-purple-700',   canRespond: true },
    { key: 'admin',      label: 'Lybertas', badge: 'bg-blue-600 text-white' },
  ],
  brand: {
    primary: '#2563EB', // Blau
  },
}
