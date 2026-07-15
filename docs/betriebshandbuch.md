# LYBERTAS — Betriebshandbuch

Damit wir bei mehreren Projekten nicht durcheinanderkommen. In Klartext.

---

## Das Bild in einem Satz

- **Ein GitHub-Repo** = das **Rezept** (der Code). Gibt es nur einmal.
- **Vercel-Projekt** = die laufende **Website** (die Küche, die das Rezept kocht).
- **Supabase** = die **Datenbank** (der Vorratsschrank mit den echten Daten).

Ein Rezept — aber jeder Standort hat seine **eigene Küche**, die es kocht,
und seinen **eigenen Vorratsschrank**. Ändere ich das Rezept, ändert sich,
was **alle** Küchen kochen. Aber Kölns Vorratsschrank und Fresenius'
Vorratsschrank werden **nie** vermischt.

---

## Die goldene Regel (das Wichtigste)

| Was du änderst | Was es betrifft |
|---|---|
| **Code** (Repo) | **ALLE** Websites, die dieses Repo nutzen (Köln + Campus) |
| **Daten / Migration** (Supabase) | **NUR** die eine Datenbank, in deren SQL-Editor du sie ausführst |

Merksatz: **Code ist gemeinsam. Daten sind getrennt.**

---

## Zwei Phasen — wo stehen wir?

### Phase 1 — JETZT (Stand heute)
Alles einfach, nur Köln:
- **1** GitHub-Repo · **1** Vercel-Projekt · **1** Supabase
- Arbeitsweise: Änderung → auf `main` → automatisch live. (Für ein
  Projekt völlig okay.)

### Phase 2 — sobald die Campus-Demo gebaut wird
- **1** GitHub-Repo (bleibt für immer eins)
- **2** Vercel-Projekte: Köln + Campus-Demo
- **2** Supabase: Köln-DB + Campus-DB
- Arbeitsweise ändert sich (siehe „Workflow ab Phase 2" unten) — **das ist
  die wichtigste Umstellung**, weil ein Code-Fehler sonst beide Live-Seiten
  gleichzeitig treffen kann.

Wir sind **noch in Phase 1**. Das zweite Vercel/Supabase entsteht erst,
wenn wir den Campus-Bau wirklich starten.

---

## Die Landkarte (was ist was)

| Ding | Phase 1 (jetzt) | Phase 2 (ab Campus) |
|---|---|---|
| GitHub-Repo | `pericmarco/libertas` | dasselbe |
| Vercel Köln | Projekt „Köln", `app.lybertas.de` | dasselbe |
| Vercel Campus | — | Projekt „Campus-Demo", `campus-demo.lybertas.de` |
| Supabase Köln | die aktuelle DB | dieselbe |
| Supabase Campus | — | neue, eigene DB |

---

## Wie mache ich eine Änderung? (Entscheidungsbaum)

**1. Ich will das Aussehen oder Verhalten der App ändern** (Text, Knopf,
neue Funktion) → das ist **Code** → geht ins **Repo**.
→ Betrifft in Phase 2 **beide** Seiten. Wenn es nur eine betreffen soll,
muss es über **Konfiguration/Module** gelöst werden (nicht „schnell nur
für Köln reinschreiben" — das ist genau die Falle).

**2. Ich will die Datenbank ändern** (neue Spalte, Policy, Migration) →
das ist **Daten** → im **SQL-Editor der richtigen Supabase** ausführen.
→ Köln-Migration in die **Köln-DB**, Campus-Migration in die **Campus-DB**.
Nie kreuzen.

**3. Ich will nur bei Köln etwas sehen, nicht bei Campus (oder umgekehrt)**
→ Bei **Daten** ist das automatisch getrennt (eigene DB).
→ Bei **Code/Optik** läuft es über die **Produktlinien-Konfiguration**
(`config/city.ts` vs `config/campus.ts`) — darum kümmert sich Claude beim
Bauen.

---

## Migrationen mit zwei Datenbanken (die häufigste Verwechslung)

- Jede Migration gehört zu **einem** Produkt. Regel: **In welche Datenbank
  gehört diese Migration?** — und nur dort im SQL-Editor ausführen.
- **Bevor** du eine Migration ausführst, im Supabase-Dashboard oben prüfen:
  **Bin ich im richtigen Projekt** (Köln vs Campus)?
- Claude kennzeichnet jede Migration klar (Dateiname/Kommentar), zu welchem
  Produkt sie gehört.
- Faustregel: „Ist durch" immer mit dem Hinweis **welche** DB, damit Claude
  gegen die richtige verifizieren kann.

---

## Workflow ab Phase 2 (Schluss mit „direkt auf main")

Sobald **zwei** Live-Seiten dasselbe Repo teilen, kann eine kaputte
Änderung **beide** gleichzeitig umwerfen. Deshalb ab dann:

```
Feature-Branch  →  Preview (Testlink)  →  kurz Köln + Campus prüfen  →  Merge  →  Live
```

- **Nicht** mehr direkt auf `main` pushen und sofort live gehen.
- Vercel baut zu jedem Branch automatisch eine **Preview** (eigene
  Testadresse) — dort schauen, bevor es echt live geht.
- Kein großes CI/CD-Monster nötig — nur diese Disziplin.

(In Phase 1, solange nur Köln läuft, bleibt „auf main → live" okay.)

---

## Wer darf was (Zugänge)

| System | Zweck | Zugriff für |
|---|---|---|
| GitHub `pericmarco/libertas` | Code / Migrations-Dateien | Marco, Tobias |
| Vercel | Deployments, Domains, Env-Variablen | Marco, Tobias |
| Supabase | Datenbanken, SQL-Editor | Marco, Tobias (als „Developer") |

Env-Variablen (welche Website auf welche Datenbank zeigt) liegen **pro
Vercel-Projekt** getrennt — Köln zeigt auf Köln-DB, Campus auf Campus-DB.
Die richtet Claude beim Aufsetzen ein.

---

## Häufige Stolperfallen (kurz-Checkliste)

- ❌ Migration im falschen Supabase-Projekt ausgeführt → immer oben das
  Projekt prüfen.
- ❌ „Nur für Köln" direkt in den gemeinsamen Code geschrieben → gehört in
  die Konfiguration, sonst betrifft es Campus mit.
- ❌ In Phase 2 direkt auf `main` gepusht → erst Preview.
- ❌ Angenommen, eine Code-Änderung betreffe nur eine Seite → Code ist
  immer gemeinsam.
- ✅ Im Zweifel: kurz Claude fragen „wohin gehört das — Code oder DB, Köln
  oder Campus?" bevor du es ausführst.

---

## Der eine Merksatz für den Kühlschrank

> **Ein Rezept (Repo). Getrennte Küchen (Vercel). Getrennte Vorräte
> (Supabase). Code ändert alle. Daten bleiben getrennt.**
