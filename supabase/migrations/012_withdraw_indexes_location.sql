-- ─────────────────────────────────────────
-- Block 1 (Backlog): Forderung zurückziehen, FK-Indizes, Ort-Feld
--
-- Zurückziehen als Soft-Delete: Status "zurückgezogen" statt hartem
-- Löschen, damit intern nachvollziehbar bleibt was passiert ist.
-- Umsetzung über eine SECURITY-DEFINER-Funktion mit eigener
-- Eigentümer-Prüfung — bewusst KEINE breite UPDATE-Policy auf demands,
-- sonst könnte ein Autor seiner Forderung z. B. selbst den Status
-- "umgesetzt" geben.
-- ─────────────────────────────────────────

-- 1. Status "zurückgezogen" erlauben
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_status_check;
ALTER TABLE demands ADD CONSTRAINT demands_status_check
  CHECK (status IN ('eingereicht','geprüft','bearbeitet','umgesetzt','abgelehnt','zurückgezogen'));

-- 2. Zurückziehen nur durch den Autor
CREATE OR REPLACE FUNCTION withdraw_demand(d_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE demands
    SET status = 'zurückgezogen'
    WHERE id = d_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nicht berechtigt oder Forderung nicht gefunden';
  END IF;
END;
$$;

-- 3. Freitext-Ort speichern (Formularfeld existierte, wurde aber verworfen)
ALTER TABLE demands ADD COLUMN IF NOT EXISTS location text;

-- 4. Indizes auf Fremdschlüssel (Postgres legt die nicht automatisch an;
--    die UNIQUE-Constraints decken jeweils nur die führende Spalte ab)
CREATE INDEX IF NOT EXISTS idx_demand_arguments_user       ON demand_arguments(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_argument_likes_user  ON demand_argument_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_responses_user         ON vote_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_options_vote           ON vote_options(vote_id);
CREATE INDEX IF NOT EXISTS idx_demands_district            ON demands(district_id);
CREATE INDEX IF NOT EXISTS idx_demands_user                ON demands(user_id);
CREATE INDEX IF NOT EXISTS idx_demands_status              ON demands(status);
CREATE INDEX IF NOT EXISTS idx_comments_demand             ON comments(demand_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand     ON demand_responses(demand_id);
CREATE INDEX IF NOT EXISTS idx_news_district               ON news(district_id);
CREATE INDEX IF NOT EXISTS idx_profiles_district           ON profiles(district_id);
CREATE INDEX IF NOT EXISTS idx_districts_region            ON districts(region_id);
CREATE INDEX IF NOT EXISTS idx_district_demographics_region ON district_demographics(region_id);
CREATE INDEX IF NOT EXISTS idx_politicians_district        ON politicians(district_id);
CREATE INDEX IF NOT EXISTS idx_topics_district             ON topics(district_id);
CREATE INDEX IF NOT EXISTS idx_votes_district              ON votes(district_id);
