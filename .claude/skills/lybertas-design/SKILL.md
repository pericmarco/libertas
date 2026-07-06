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

## Radien & Flächen

- Karten/Container: `rounded-2xl`
- Buttons, Inputs, kleinere Boxen: `rounded-xl`
- Chips/Tags/Badges: `rounded-full`
- Karten-Grundmuster: `bg-white rounded-2xl border border-gray-100 p-5`
  (bzw. `p-6` bei großzügigen Karten). Keine oder nur sehr dezente
  Schatten (`shadow-sm` maximal).

## Typografie

- Schrift: Geist Sans (`--font-sans`, in `app/layout.tsx` eingebunden)
- Überschriften: `font-semibold text-gray-900`, Seiten-Titel `text-2xl`,
  Karten-Titel `text-lg` oder `font-semibold` allein
- Fließtext: Standardgröße, `text-gray-600`/`text-gray-700`
- Meta-Zeilen (Ort, Autor, Datum): `text-sm text-gray-500`

## Buttons & Interaktion

- Primär: `bg-blue-600 text-white rounded-xl hover:bg-blue-700`,
  deaktiviert `disabled:opacity-50`
- Sekundär: weiße Fläche mit `border border-gray-200`, Hover `bg-gray-50`
- Auswahl-Chips (Wizard, Positions-Typen): `rounded-full border`, aktiv
  `bg-blue-50 border-blue-300 text-blue-700` (bzw. Farbvariante des Typs)
- Destruktiv: rote Text- oder Rahmenvariante, nie großflächig rot

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
- Inhaltsbreite: `max-w-6xl mx-auto px-6` (Navbar) bzw. schmalere
  `max-w-2xl`/`max-w-3xl` für Formulare und Detailseiten

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
   …), bisher kaum genutzt; die Seiten stylen meist direkt.
3. **Diese Datei** — bei jeder bewussten Design-Entscheidung
   mitaktualisieren.

Bei größeren Umstellungen: erst eine Seite als Referenz umbauen
(z. B. Dashboard), vom Nutzer abnehmen lassen, dann den Rest nachziehen.
