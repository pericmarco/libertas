# LYBERTAS Campus — Umfang der Verkaufs-Demo

**Status:** Entwurf zur Besprechung (Marco + Tobias). Noch nichts gebaut.
**Zweck:** Erstes Produkt der Produktlinie **LYBERTAS Campus** — als
überzeugende Demo, mit der wir über den Studenten-Draht auf die
Hochschule Fresenius zugehen.

---

## 1. Grundhaltung

Wir bauen **nicht** die fertige Multi-Standort-Infrastruktur auf Verdacht.
Wir bauen eine Demo, die den *Gedanken* zeigt und den Termin gewinnt. Die
produktionsreife Standort-Trennung (RLS, Rollen, Self-Service, Reporting)
kommt **nach** Vertragsabschluss und wird von der Aufsetzgebühr finanziert.

Klare Trennung:
- **Für den Verkauf (jetzt):** hochschul-sprechende Demo, Beispiel-Campusse,
  Campus-Umschalter, config-getriebenes Wording — deutlich als Demo markiert.
- **Nach Zusage (bezahlt):** vollständige RLS, Campus-/Gruppenadmins,
  Rechte-Matrix, Einladungs-/Verifizierungsprozess, Gruppenauswertung,
  produktive Backups, Datenschutz/Verträge, Self-Service-Konfiguration.

## 2. Was die Demo NICHT ist (bewusst außen vor)

- Kein Umbau der laufenden Köln-App. Köln bleibt unangetastet und stabil.
- Keine geteilte Multi-Tenant-Datenbank für mehrere Hochschulen.
- Keine wasserdichte Standort-RLS (in der Demo trennt ein Filter, nicht die
  Datenbank — die Demo trägt kein echtes Kundendaten-Risiko).
- Keine Campus-Admin-/Gruppenadmin-Rollenmatrix.
- Keine perfekte Modul-/Monorepo-Architektur vorab. Die gemeinsame Naht
  bildet sich beim Bauen; Köln zerlegen wir in Module erst, wenn die
  Doppelung wirklich weh tut.

## 3. Drei Ebenen (Begriffsklärung)

```
Produktlinie      LYBERTAS Campus   (vs. LYBERTAS City = Köln)
Kunde/Organisation Hochschule Fresenius
Untereinheiten    Campusse/Standorte: Köln, Idstein, …  (location_id)
```

Wichtig: Die Fresenius-Standorte sind **keine** eigenen Kunden, sondern
Standorte *innerhalb* einer Fresenius-Instanz — eine Datenbank, Inhalte
tragen eine `location_id`. (Grund: Fresenius will später gruppenweite
Auswertung; getrennte DB pro Campus würde das ruinieren.)

## 4. Wording-Karte (City → Campus)

Gleiche Logik im Hintergrund, andere Begriffe pro Produktlinie:

| LYBERTAS City (Köln) | LYBERTAS Campus (Fresenius) |
|---|---|
| Forderung | Anliegen |
| Bürger | Studierende |
| Stadtteil | Campus |
| Politiker | Hochschulleitung |
| Amt / Zuständige Stelle | Servicebereich / Zuständige Stelle |
| Stadtumfrage | Campus-Umfrage |
| Mängelmelder | Technisches Problem melden |
| Stadtprojekt | Campusprojekt |

Diese Begriffe kommen aus einer Konfigurationsdatei (`config/campus.ts`),
nicht aus verstreutem `if`-Code.

## 5. Module in der Campus-Demo

| Modul | Campus | Anmerkung |
|---|---|---|
| Anliegen einreichen/unterstützen | an | Kern |
| Kommentare/Positionen | an | Kern |
| Campus-Umfragen | an | Kern |
| Technisches Problem melden | an | entspricht Mängelmelder |
| Wichtige Links | an | Prüfungsamt, IT-Support, Bibliothek, Studienberatung … |
| Fakultäten / Fachbereiche | an | Kategorisierung statt „Themenbereiche" |
| Hochschulleitung antwortet | an | Phase-A-Antwortlogik, Badge = Servicebereich/Leitung |
| Politiker | aus | City-spezifisch |
| Stadtteile / Ratsverteilung | aus | City-spezifisch |
| Karte | offen | Campus-Karte optional — mit euch klären |

## 6. Datenstruktur der Demo

```
organizations
  id, name, type            (1 Zeile: Hochschule Fresenius, type=university)

locations
  id, organization_id, name, type, status
  z. B.  1|Fresenius|Köln|campus   2|Fresenius|Idstein|campus

demands   (Anliegen)
  … + location_id

surveys   (Campus-Umfragen)
  … + location_id
  (später: survey_locations für standortübergreifende Umfragen)

campus_links   id, location_id, label, url, kategorie
faculties      id, location_id, name
```

**Demo-Tiefe:** echte Tabellen + `location_id` + Campus-Umschalter +
standortspezifische Beispielinhalte. **Noch nicht:** vollständige RLS,
Standort-Rollen, Self-Service. Klar als Demo-/Testsystem gekennzeichnet.

## 7. Der eine technische Kern: die „Zuordnungs-Einheit"

Der gemeinsame Code braucht **eine** Abstraktion über „die Einheit, die
Inhalte zuordnet": in City ist das `district_id` (Stadtteil), in Campus
`location_id` (Campus). Wird das an einer Stelle sauber gekapselt, sind
80 % von „ein Codebase, zwei Produkte" gelöst. Wird es überall verstreut
`if (city)`, wird es Chaos.

## 8. Betrieb & Deployment

```
GitHub:   ein Repo (pericmarco/libertas)
Vercel:   Projekt Köln  +  Projekt Campus-Demo
Supabase: Projekt Köln  +  Projekt Campus-Demo (eigene kleine DB)
Domain:   campus-demo.lybertas.de  → Campus-Demo-Projekt
Env:      PRODUCT_LINE=campus  TENANT_KEY=fresenius-demo
```

Köln und Campus laufen getrennt (eigene DB = physisch getrennte Daten),
gleiche Codebasis. Kein Merge nötig — die Domain verteilt nur Subdomains.

## 9. Prozess-Umstellung (NICHT vergessen)

Sobald ein **zweites Produktions-Deployment** dasselbe Repo teilt, wird
unser bisheriges „Push auf `main` → sofort live" gefährlich: Eine
Core-Änderung fasst Köln und Campus gleichzeitig an. Vor dem Campus-Livegang
stellen wir um auf:

```
Feature-Branch → Preview → Test City → Test Campus → Merge → Production
```

Kein großes CI/CD-Monster, aber Schluss mit direktem Push auf main.

## 10. Seed-Inhalte für die Demo

- 2 Beispiel-Campusse (z. B. Köln + Idstein).
- Je Campus ein paar realistische Anliegen: Prüfungsamt-Erreichbarkeit,
  WLAN/IT-Support, Mensa-Öffnungszeiten, Bibliotheks-Lernplätze, Parken.
- 1 Campus-Umfrage.
- „Wichtige Links" (Prüfungsamt, IT, Bibliothek, Studienberatung).
- Fakultätsliste.
- 1 offizielle Antwort der „Hochschulleitung / Servicebereich".

## 11. Pitch-Framing (ehrlich)

Nicht behaupten, alle Standorte seien produktionsbereit. Stattdessen:
> „Die Plattform ist technisch als Multi-Campus-Lösung vorbereitet. Im
> Rahmen des Onboardings konfigurieren wir Standortstruktur, Rollen,
> Inhalte und Prozesse gemeinsam mit Fresenius."

**Branding-Vorsicht:** Die öffentlich erreichbare Demo darf nicht wie die
echte, offizielle Fresenius-Seite wirken. Klar als „Demonstration /
Vorschlag von Lybertas" kennzeichnen, neutrale Platzhalter-Optik statt
echtem Fresenius-Logo als sei es offiziell.

## 12. Preis ≠ Infrastruktur

Pro Campus abrechnen heißt **nicht** ein Projekt/DB pro Campus. Eine
Fresenius-Instanz bedient alle Campusse. Wahrscheinlich zwei Angebote:
- **Einzelstandort-Pilot:** ein Campus, einmalige Einrichtung, Monatslizenz,
  Testzeitraum.
- **Gruppen-/Multi-Campus:** zentrale Instanz, Grundlizenz + Preis pro
  aktivem Campus + Mengenrabatt, zentrale Auswertung, Campusadmins.

## 13. Offene Fragen an Marco & Tobias

1. Wie viele Fresenius-Standorte zeigen wir in der Demo (2 reichen)?
2. Typische Studierenden-Anliegen je Campus — welche Kategorien treffen den
   Alltag am besten (Prüfungsamt, IT, Mensa, Bibliothek, Parken, …)?
3. Karte behalten (Campus-Karte) oder für Campus weglassen?
4. Branding: neutrale Campus-Optik für die Demo — okay? (Kein echtes
   Fresenius-Logo als „offiziell".)
5. Reihenfolge: erst Wording+Module (schnell sichtbar) oder erst die
   location-Struktur?
