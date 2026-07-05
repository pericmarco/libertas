-- ─────────────────────────────────────────
-- Stadtumfragen anlegen: Rechte für Admin- und Stadt-Rolle
--
-- Bisher konnten Umfragen nur per SQL-Editor angelegt werden. Jetzt
-- dürfen Konten mit Rolle 'city' oder 'admin' Umfragen samt Optionen
-- über die App erstellen. Löschen bleibt Admins vorbehalten
-- (vote_options und vote_responses hängen per ON DELETE CASCADE dran).
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_city_or_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('city', 'admin'));
$$;

CREATE POLICY "Stadt und Admins erstellen Umfragen" ON votes
  FOR INSERT WITH CHECK (is_city_or_admin());

CREATE POLICY "Stadt und Admins erstellen Optionen" ON vote_options
  FOR INSERT WITH CHECK (is_city_or_admin());

CREATE POLICY "Admins löschen Umfragen" ON votes
  FOR DELETE USING (is_admin());

-- Aufräumen beim Löschen einer Umfrage sicherstellen: beide Referenzen
-- aus vote_responses müssen kaskadieren, sonst blockiert option_id die
-- Kaskade über vote_options
ALTER TABLE vote_responses DROP CONSTRAINT IF EXISTS vote_responses_vote_id_fkey;
ALTER TABLE vote_responses ADD CONSTRAINT vote_responses_vote_id_fkey
  FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE;
ALTER TABLE vote_responses DROP CONSTRAINT IF EXISTS vote_responses_option_id_fkey;
ALTER TABLE vote_responses ADD CONSTRAINT vote_responses_option_id_fkey
  FOREIGN KEY (option_id) REFERENCES vote_options(id) ON DELETE CASCADE;
