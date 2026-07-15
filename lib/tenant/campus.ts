// LYBERTAS Campus — Konfiguration für Hochschulen
// Erste Instanz: Hochschule Fresenius · Campus Köln (Verkaufs-Demo).
//
// ENTWURF — Wording, Module und Rollen bitte mit Marco & Tobias prüfen.
// Diese Config wird erst gegen die (morgen entstehende) Campus-Datenbank
// verdrahtet. Köln ist davon nicht betroffen.

import type { TenantConfig } from './config'

export const campusConfig: TenantConfig = {
  productLine: 'campus',
  key: 'fresenius-koeln',
  labels: {
    appName: 'Lybertas Campus',
    orgName: 'Hochschule Fresenius · Campus Köln',
    demand: 'Anliegen',
    demandPlural: 'Anliegen',
    person: 'Studierende',
    unit: 'Fachbereich',
    unitPlural: 'Fachbereiche',
    authority: 'Hochschule',
    authorityStelle: 'Zuständige Stelle',   // Studienservice / Prüfungsamt / Leitung
    survey: 'Hochschul-Umfrage',
    defect: 'Technisches Problem',
    newsTitle: 'Neuigkeiten der Hochschule',
    dashboardTitle: 'Dein Campus-Dashboard',
  },
  modules: {
    dashboard: true,
    news: true,            // Kern-Feature: gebündelte Hochschul-Neuigkeiten
    anliegen: true,        // Studierenden-Anliegen (umbenannte Forderungen)
    umfragen: true,        // Hochschul-Umfragen
    techProblem: true,     // technisches Problem melden (WLAN, Technik …)
    wichtigeLinks: true,   // Prüfungsamt, IT-Support, Bibliothek, Studienberatung
    einheiten: true,       // Fachbereiche (statt Stadtteile)
    politiker: false,      // City-spezifisch
    ratsverteilung: false, // City-spezifisch
    karte: false,          // ein Campus → keine Karte
    wirkung: false,        // für die Demo nicht nötig
    profil: true,
    admin: true,
  },
  // Offizielle Antwort-Rollen entsprechen der Phase-A-Logik; das Badge zeigt
  // die zuständige Stelle (statt einer Partei).
  roles: [
    { key: 'citizen',         label: 'Studierende',      badge: 'bg-gray-100 text-gray-600' },
    { key: 'studienservice',  label: 'Studienservice',   badge: 'bg-emerald-100 text-emerald-700', canRespond: true },
    { key: 'pruefungsamt',    label: 'Prüfungsamt',      badge: 'bg-amber-100 text-amber-700',     canRespond: true },
    { key: 'hochschulleitung',label: 'Hochschulleitung', badge: 'bg-purple-100 text-purple-700',   canRespond: true },
    { key: 'admin',           label: 'Lybertas',         badge: 'bg-blue-600 text-white' },
  ],
  brand: {
    // Platzhalter-Farbe für die Demo — bewusst NICHT das offizielle
    // Fresenius-Logo/-CI, damit die Demo nicht als echte Hochschulseite wirkt.
    primary: '#0F766E', // Teal
    demoBanner: 'Demonstration / Vorschlag von Lybertas – keine offizielle Seite der Hochschule Fresenius',
  },
}
