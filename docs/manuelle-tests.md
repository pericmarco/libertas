# Manuelle Tests (brauchen echte Nutzer / Browser)

Diese Liste sammelt Dinge, die sich nicht automatisch gegen die DB testen
lassen, sondern einen echten eingeloggten Nutzer im Browser brauchen.

## Offen

- [ ] **Schutz gegen Selbst-Beförderung zum Admin**
  Ein normaler Nutzer (role = citizen) darf sich nicht selbst zum Admin
  machen können. Test: Als eingeloggter Nicht-Admin im Browser versuchen,
  über die App-Konsole ein `supabase.from('profiles').update({ role: 'admin' })`
  auf die eigene Zeile abzusetzen. Erwartung: role bleibt danach `citizen`
  (der Trigger `protect_profile_role` setzt sie still zurück).
  Danach in der DB prüfen: `SELECT role FROM profiles WHERE id = <user>;`

## Erledigt

- [x] Registrierung → E-Mail-Bestätigung → Onboarding speichert Name,
  Altersgruppe, Geschlecht, Stadtteil (getestet mit Tobias & Marco, 2026-07)
- [x] Routen-Schutz: interne Seiten ohne Login leiten auf /login um
- [x] Likes/Unterstützen-Toggle (nach DELETE-Policy-Fix)
