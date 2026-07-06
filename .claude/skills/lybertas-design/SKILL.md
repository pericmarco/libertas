---
name: lybertas-design
description: Designsprache der Lybertas-Plattform. Bei allen UI-Arbeiten anwenden — neue Seiten, neue Komponenten, Umbauten bestehender Ansichten — damit die Oberfläche über alle Seiten hinweg konsistent bleibt. Bei bewussten Design-Änderungen zuerst diese Datei anpassen, dann den Code.
---

# Lybertas — Designsprache

Diese Datei ist die verbindliche Referenz für das Erscheinungsbild der
Plattform. Wer das Design ändert, ändert **zuerst hier**, dann im Code —
so bleibt die Doku die einzige Quelle der Wahrheit.

## Grundhaltung

Lybertas ist eine Bürgerbeteiligungsplattform, die gegenüber Stadt und
Politik seriös auftreten muss und gleichzeitig für alle Bürger zugänglich
sein soll. Das Design ist deshalb:

- **Klar und ruhig** — viel Weißraum, wenige Farben, keine Deko-Effekte
- **Vertrauenswürdig** — eher amtlich-modern als verspielt
- **Mobile-first** — die meisten Bürger nutzen die Plattform am Handy

## Farben

Aktuell werden direkte Tailwind-Utility-Klassen verwendet (nicht die
shadcn-Tokens aus `globals.css` — die existieren, sind aber weitgehend
ungenutzt).

| Rolle | Klasse(n) |
|---|---|
| Primärfarbe (Aktionen, aktive Nav, Logo) | `bg-blue-600`, `text-blue-600`, Hover `bg-blue-700` |
| Primär-Hintergrund (aktive Chips, Info-Flächen) | `bg-blue-50` |
| Seitenhintergrund | `bg-gray-50` |
| Karten | `bg-white` mit `border border-gray-100` |
| Text primär / sekundär | `text-gray-900` / `text-gray-500` (Hilfetexte `text-gray-400`) |
| Hinweis / Entwurf / Schwellenwert | `amber-*` (gelbe Banner) |
| Mängelmeldung | `orange-*` (Badge + Banner, Wrench-Icon) |
| Erfolg | `green-*` |
| Fehler / destruktiv | `red-*` |

Rollen-Badges: Stadt = blau, Politiker = violett, Admin = grau/dunkel.

**Grau-Regel:** Lesbarer Text (Beschreibungen, Hilfetexte, Snippets) nie
heller als `text-gray-500`. `text-gray-400` ist reserviert für
Eyebrow-Labels (`text-xs font-semibold text-gray-400 uppercase
tracking-wide`) und rein dekorative Elemente.

## Radien & Flächen

- Karten/Container: `rounded-2xl`
- Buttons, Inputs, kleinere Boxen: `rounded-xl`
- Chips/Tags/Badges: `rounded-full`
- **Verschachtelung eine Stufe kleiner:** Segmente/Pills *innerhalb*
  eines `rounded-xl`-Containers (Tab-Leisten, Like-Pills) nutzen
  `rounded-lg` — das ist gewollt, nicht inkonsistent.
- Karten-Grundmuster: `bg-white rounded-2xl border border-gray-100 p-5`
  (bzw. `p-6` bei großzügigen Karten). Keine oder nur sehr dezente
  Schatten (`shadow-sm` maximal). `components/ui/card.tsx` folgt
  diesem Muster — für neue Karten entweder die Komponente oder das
  Muster von Hand verwenden.
- Klickbare Karten: `hover:border-blue-200 hover:shadow-sm
  transition-all` (bei farbigen Rahmen, z. B. Parteikarten, nur
  `hover:shadow-sm`). Nicht-klickbare Karten bekommen **keinen**
  Hover-Effekt.

## Typografie

- Schrift: Geist Sans (`--font-sans`, in `app/layout.tsx` eingebunden)
- Seiten-Titel: Top-Level-Seiten (alles in der Bottom-Nav + Admin)
  `text-3xl font-bold text-gray-900`; Unterseiten, Auth- und
  Rechtsseiten `text-2xl font-bold text-gray-900`. Untertitel darunter:
  `text-gray-500 mt-1`.
- Karten-/Abschnitts-Titel: `font-semibold text-gray-900`
  (`text-lg` bei größeren Karten)
- Fließtext: Standardgröße, `text-gray-600`/`text-gray-700`
- Meta-Zeilen (Ort, Autor, Datum): `text-sm text-gray-500`
- Zurück-Links: `text-sm text-gray-500 hover:text-gray-900`

## Buttons & Interaktion

- Primär: `bg-blue-600 text-white rounded-xl hover:bg-blue-700
  transition-colors`, deaktiviert `disabled:opacity-50`
- Sekundär: weiße Fläche mit `border border-gray-200 rounded-xl`,
  Hover `bg-gray-50`
- Auswahl-Chips (Wizard, Positions-Typen): `rounded-full border`, aktiv
  `bg-blue-50 border-blue-300 text-blue-700` (bzw. Farbvariante des Typs)
- Destruktiv: rote Text- oder Rahmenvariante, nie großflächig rot

## Formularfelder

Kanonisches Muster für Inputs, Selects und Textareas:

```
w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

(`focus:border-transparent` gehört immer dazu, damit unter dem blauen
Fokus-Ring kein grauer Rand durchscheint. Textareas ergänzen
`resize-none`.)

## Layout & Navigation

- Fixe Top-Bar `h-16` (Desktop-Nav), fixe Bottom-Nav 64 px auf Mobile
  (`md:hidden`), interne Seiten nutzen `<main class="pt-16 …">`
- **Mobile-Regel:** `globals.css` gibt `main.pt-16` auf Mobile
  `padding-bottom: 6rem`, damit nichts hinter der Bottom-Nav
  verschwindet. Neue fixe Elemente am unteren Rand brauchen eigenen
  Ausgleich (siehe Schreibleiste im Diskussions-Overlay,
  Content-Padding `pb-44`).
- Vollbild-Overlays: `fixed inset-0 z-50` + Body-Scroll-Lock per
  `useEffect` (`document.body.style.overflow`), sticky Header mit
  Titel + Schließen-X
- Inhaltsbreite: `max-w-6xl mx-auto px-6` für breite Seiten (Dashboard,
  Abstimmungen, Politiker, Admin), `max-w-3xl` für Listen,
  `max-w-2xl` für Formulare und Detailseiten. Vertikal: `py-10`.
- Seiten-`<main>` immer mit explizitem `bg-gray-50` (nicht auf den
  Body-Hintergrund verlassen)

## Icons

`lucide-react`, Standardgröße 16–20 px, `strokeWidth` 1.8 (aktiv 2.5 in
der Bottom-Nav). Feste Zuordnungen: Megaphone = Forderungen,
Vote = Priorisierung, Wrench = Mängelmeldung, ShieldCheck = Admin,
TrendingUp = Wirkung, Flame = Schwellenwert erreicht.

## Sprache in der UI

Durchgehend Deutsch, „du"-Ansprache, kurze Sätze. Fehlermeldungen
freundlich und konkret (was ist passiert, was kann man tun). Interne
Begriffe (Moderationsstatus, RLS, Scores) tauchen in Bürger-Ansichten
nicht auf.

## Zentrale Stellschrauben für Redesigns

1. **`app/globals.css`** — Tailwind-v4-`@theme`-Tokens und
   oklch-Variablen (shadcn-Standard). Für ein echtes Redesign: Farben
   hier als Tokens definieren und die Seiten schrittweise von
   Hardcode-Klassen (`bg-blue-600` & Co., ~40+ Stellen) auf Tokens
   umstellen.
2. **`components/ui/`** — shadcn-Basiskomponenten (button, card, badge,
   …). `card.tsx` und `badge.tsx` sind an die Designsprache angeglichen
   (Feinschliff 07/2026) und werden von Dashboard, Abstimmungen und
   Politiker genutzt; die übrigen Seiten stylen direkt.
3. **Diese Datei** — bei jeder bewussten Design-Entscheidung
   mitaktualisieren.

Bei größeren Umstellungen: erst eine Seite als Referenz umbauen
(z. B. Dashboard), vom Nutzer abnehmen lassen, dann den Rest nachziehen.
