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

## Erledigt

- [x] Registrierung → E-Mail-Bestätigung → Onboarding speichert Name,
  Altersgruppe, Geschlecht, Stadtteil (getestet mit Tobias & Marco, 2026-07)
- [x] Routen-Schutz: interne Seiten ohne Login leiten auf /login um
- [x] Likes/Unterstützen-Toggle (nach DELETE-Policy-Fix)
- [x] Schutz gegen Selbst-Beförderung zum Admin — live verifiziert per
  simuliertem authenticated-Kontext im SQL-Editor (role blieb admin trotz
  Update-Versuch, 2026-07). Hinweis: seit Migration 014 dürfen Admins
  Rollen ändern, normale Nutzer bleiben blockiert.
