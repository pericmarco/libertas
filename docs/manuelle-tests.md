# Manuelle Tests (brauchen echte Nutzer / Browser)

Diese Liste sammelt Dinge, die sich nicht automatisch gegen die DB testen
lassen, sondern einen echten eingeloggten Nutzer im Browser brauchen.

## Offen

- [ ] **Admin-Bereich: Moderations-Workflow einmal durchspielen**
  Als Admin unter /admin eine Forderung aufklappen, Titel/Problem anpassen,
  Moderationsstatus + interne Notiz setzen, speichern. Erwartung: Änderungen
  sichtbar, Notiz erscheint NICHT auf der öffentlichen Detailseite.

- [ ] **Admin-Bereich: Rollenvergabe per Klick**
  Im Nutzer-Tab einem Test-Account die Rolle "Stadt" geben. Erwartung:
  Rolle ändert sich, Badge erscheint an dessen Beiträgen. Danach zurück
  auf "Bürger" setzen.

- [ ] **Nicht-Admin sieht /admin nicht**
  Als normaler Bürger-Account /admin direkt per URL aufrufen. Erwartung:
  "Kein Zugriff"-Meldung, keine Daten sichtbar. (RLS-Schutz der Daten ist
  bereits automatisiert verifiziert, hier geht's um die UI.)

- [ ] **Schwellenwert-Hinweis**
  Sobald eine Forderung 50+ Relevanzpunkte hat: erscheint der gelbe
  Banner + die Flamme-Markierung im Admin-Bereich?

- [ ] **Einreichungs-Wizard: Bürgeranliegen komplett durchspielen**
  Wiederkehrendes Problem einreichen (z. B. das Haltestellen-Beispiel):
  alle 8 Schritte, Zurück-Button, Tags aus mehreren Bereichen, Vorschau
  mit Stift-Korrektur. Erwartung: erscheint in der Liste, Themenbereich-
  Filter findet sie in allen zugehörigen Bereichen, Detailseite zeigt
  "Weitere Details anzeigen" mit allen Angaben.

- [ ] **Einreichungs-Wizard: Mängelmeldung einreichen**
  Konkreten Schaden melden (z. B. kaputte Laterne). Erwartung: Rückmelde-
  Schritt zeigt nur den Hinweis "geht ans Lybertas-Team", Meldung
  erscheint NICHT in der öffentlichen Liste, aber im Admin-Bereich mit
  orangem Mängelmeldung-Badge; Detailseite (per Link) ohne Positionen,
  mit Weiterleitungs-Verlauf.

- [ ] **Karte: Mangel mit Pin melden**
  Mangel einreichen, im Ort-Schritt einen Punkt auf der Karte setzen,
  absenden. Erwartung: Detailseite zeigt die "Ort"-Karte mit dem Pin.
  Danach einen zweiten Mangel melden: der erste muss im Karten-Schritt
  als oranger Pin erscheinen (antippen → Titel-Popup).

- [ ] **Karte: Forderung mit Ort**
  Forderung (kein Mangel) mit konkretem Ort + Pin einreichen.
  Erwartung: Pin erscheint auf der Übersichtskarte unter /forderungen
  (Beispiel-Badge verschwindet), Popup zeigt Titel + "Öffnen".
  Der Mangel aus dem Test davor darf dort NICHT auftauchen.

- [ ] **Karte: Bedienung am Handy**
  Auf der Einreichen-Karte mit einem Finger wischen → Seite scrollt,
  Hinweis "Karte mit zwei Fingern bewegen" erscheint. Zwei Finger →
  Karte bewegt sich. Standort-Button (oben rechts) fragt nach Freigabe
  und springt zum eigenen Standort.

- [ ] **Rate-Limit testen (optional, mit Test-Account)**
  Als normaler Bürger 4 Anliegen an einem Tag einreichen — das vierte
  muss mit freundlicher Meldung abgelehnt werden. (Admins sind ausgenommen,
  also nicht mit euren Konten testbar.)

## Erledigt

- [x] Registrierung → E-Mail-Bestätigung → Onboarding speichert Name,
  Altersgruppe, Geschlecht, Stadtteil (getestet mit Tobias & Marco, 2026-07)
- [x] Routen-Schutz: interne Seiten ohne Login leiten auf /login um
- [x] Likes/Unterstützen-Toggle (nach DELETE-Policy-Fix)
- [x] Schutz gegen Selbst-Beförderung zum Admin — live verifiziert per
  simuliertem authenticated-Kontext im SQL-Editor (role blieb admin trotz
  Update-Versuch, 2026-07). Hinweis: seit Migration 014 dürfen Admins
  Rollen ändern, normale Nutzer bleiben blockiert.
