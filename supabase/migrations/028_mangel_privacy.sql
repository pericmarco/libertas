-- ─────────────────────────────────────────
-- Mängelmeldungen wirklich privat stellen
--
-- Befund: Die SELECT-Policy für angemeldete Nutzer war `USING (true)` — auf
-- Datenbank-Ebene konnte damit JEDE:R Angemeldete auch FREMDE Mängelmeldungen
-- lesen. Unsichtbar waren sie nur, weil die App sie aus den Listen filtert.
--
-- Unsere Datenschutzerklärung sagt aber zu: „Mängelmeldungen sind grundsätzlich
-- nicht öffentlich, sondern nur für dich und unser Team einsehbar."
-- Dieser Schritt zieht die Datenbank auf genau diese Zusage.
--
-- Danach gilt für `demands`:
--   • anon           → nur echte Forderungen (unverändert, Policy aus 020)
--   • authenticated  → alle Nicht-Mängel + EIGENE Mängel
--   • Admin          → alles (Triage-Karte im Admin-Bereich bleibt vollständig)
-- ─────────────────────────────────────────

DROP POLICY IF EXISTS "Forderungen lesbar (angemeldet)" ON public.demands;

CREATE POLICY "Forderungen lesbar (angemeldet)" ON public.demands
  FOR SELECT TO authenticated
  USING (
    submission_type IS DISTINCT FROM 'mangel'   -- normale Forderungen: offen
    OR user_id = auth.uid()                     -- eigene Mängelmeldung
    OR is_admin()                               -- Team sieht alles (Triage)
  );
