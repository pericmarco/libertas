-- ─────────────────────────────────────────
-- Block 5 (Backlog #6.3): Stadtumfragen nach Stadtteil ausrichten
--
-- target_district_id = NULL  → Umfrage für alle
-- target_district_id gesetzt → nur Nutzer aus diesem Stadtteil sehen
--   die Umfrage und dürfen abstimmen. Die Abstimm-Policy erzwingt das
--   serverseitig — das Ausblenden im Client allein wäre umgehbar.
-- ─────────────────────────────────────────

ALTER TABLE votes ADD COLUMN target_district_id uuid REFERENCES districts(id);

DROP POLICY IF EXISTS "Abstimmen" ON vote_responses;
CREATE POLICY "Abstimmen" ON vote_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      (SELECT v.target_district_id FROM votes v WHERE v.id = vote_id) IS NULL
      OR (SELECT v.target_district_id FROM votes v WHERE v.id = vote_id) =
         (SELECT p.district_id FROM profiles p WHERE p.id = auth.uid())
    )
  );
