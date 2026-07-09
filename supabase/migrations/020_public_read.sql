-- ─────────────────────────────────────────
-- Öffentliche Lese-Ansicht ohne Login
--
-- Ziel: nicht angemeldete Besucher dürfen Inhalte LESEN, aber
--   (a) NIE echte Namen oder Nutzernamen sehen und
--   (b) NIE Mängelmeldungen sehen (die gehen ans Team).
--
-- Wichtig: Bis hierher hing die Privatsphäre nur an der Login-Weiterleitung
-- der Middleware — die Datenbank selbst gab anonym alles heraus. Dieser
-- Schritt zieht den Schutz auf die Datenbank-Ebene, wo er hingehört.
-- Angemeldete Nutzer (Rolle authenticated) sind von allem hier NICHT
-- betroffen; ihre bestehenden Rechte bleiben unverändert.
-- ─────────────────────────────────────────

-- 1) Profile: Tabellen-Grant für anon zurücknehmen. Grants greifen VOR RLS,
--    d. h. anon bekommt gar keine Profildaten mehr — weder full_name noch
--    username. Angemeldete (authenticated) behalten ihren Grant aus 007.
--    SECURITY-DEFINER-Funktionen (is_admin, handle_new_user, …) laufen mit
--    Eigentümerrechten und sind davon nicht betroffen.
REVOKE SELECT ON public.profiles FROM anon;

-- 2) Forderungen: bestehende (breite) SELECT-Policies entfernen und durch
--    zwei rollenspezifische ersetzen.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demands' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.demands', pol.policyname);
  END LOOP;
END $$;

-- Angemeldete Nutzer: unveränderter Vollzugriff (Owner sieht eigene Mängel,
-- Admin sieht alles; die Listen filtern Mängel weiterhin per Query heraus).
CREATE POLICY "Forderungen lesbar (angemeldet)" ON public.demands
  FOR SELECT TO authenticated
  USING (true);

-- Nicht angemeldete Besucher: nur echte, aktive Forderungen — keine
-- Mängelmeldungen und keine zurückgezogenen.
CREATE POLICY "Öffentliche Forderungen lesbar" ON public.demands
  FOR SELECT TO anon
  USING (
    submission_type IS DISTINCT FROM 'mangel'
    AND status <> 'zurückgezogen'
  );
