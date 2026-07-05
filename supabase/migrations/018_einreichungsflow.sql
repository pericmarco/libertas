-- ─────────────────────────────────────────
-- Einreichungsflow-Konzept (05.07.2026): Strukturfelder + Spam-Schutz
--
-- Neue strukturierte Angaben aus dem geführten Wizard. `category`
-- bleibt für Alt-Forderungen als Filter-Fallback erhalten; neue
-- Einreichungen speichern Tags (Themenbereiche werden im Code aus den
-- Tags abgeleitet, eine Forderung kann mehrere Bereiche haben).
--
-- Rate-Limit serverseitig (3 Anliegen / 24h, 10 / 7 Tage pro Nutzer,
-- Admins ausgenommen) — eine reine Client-Prüfung wäre trivial umgehbar.
-- ─────────────────────────────────────────

ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS submission_type text
    CHECK (submission_type IS NULL OR submission_type IN ('mangel', 'wiederkehrend', 'vorschlag')),
  ADD COLUMN IF NOT EXISTS location_scope text
    CHECK (location_scope IS NULL OR location_scope IN ('ort', 'stadtteil', 'mehrere_orte', 'mehrere_stadtteile', 'ganz_koeln', 'unsicher')),
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS affected_groups text[],
  ADD COLUMN IF NOT EXISTS impacts text[],
  ADD COLUMN IF NOT EXISTS solution_direction text,
  ADD COLUMN IF NOT EXISTS feedback_wanted text
    CHECK (feedback_wanted IS NULL OR feedback_wanted IN ('stadt', 'politik', 'beide', 'unsicher'));

CREATE INDEX IF NOT EXISTS idx_demands_tags ON demands USING gin (tags);

CREATE OR REPLACE FUNCTION enforce_demand_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_admin() THEN
    RETURN NEW;
  END IF;
  IF (SELECT COUNT(*) FROM demands
      WHERE user_id = NEW.user_id AND created_at > now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION 'RATE_LIMIT_DAY';
  END IF;
  IF (SELECT COUNT(*) FROM demands
      WHERE user_id = NEW.user_id AND created_at > now() - interval '7 days') >= 10 THEN
    RAISE EXCEPTION 'RATE_LIMIT_WEEK';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS demands_rate_limit ON demands;
CREATE TRIGGER demands_rate_limit
  BEFORE INSERT ON demands
  FOR EACH ROW EXECUTE FUNCTION enforce_demand_rate_limit();
