-- ─────────────────────────────────────────
-- Phase 4: Relevanz-Score & Positionsmodell (Protokoll #6 + #7)
--
-- Ein Nutzer hat pro Forderung genau EINE Position (Unterstützung /
-- Gegenargument / Alternative), optional mit Textbeitrag (bei
-- Alternative verpflichtend). Position wechseln = Zeile ersetzen.
-- Der Relevanz-Score einer Forderung = Anzahl dieser Positionen
-- (ein Like + Text zählt als EIN Engagement). Schwelle: 50.
--
-- Die alte, getrennte Unterstützungslogik (demand_supports + RPCs
-- increment/decrement_supports) wird komplett abgelöst.
--
-- Hinweis: Alle Forderungs-Tabellen sind nach dem Reset (004) leer,
-- daher ist der neue UNIQUE-Constraint ohne Deduplizierung sicher.
-- ─────────────────────────────────────────

-- 1. demand_arguments: eine Position pro (Forderung, Nutzer), Text optional
ALTER TABLE demand_arguments ALTER COLUMN text DROP NOT NULL;
ALTER TABLE demand_arguments
  ADD CONSTRAINT demand_arguments_demand_user_key UNIQUE (demand_id, user_id);

-- Position wechseln / zurücknehmen braucht UPDATE + DELETE Policies
CREATE POLICY "Eigene Position ändern" ON demand_arguments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Position löschen" ON demand_arguments
  FOR DELETE USING (auth.uid() = user_id);

-- 2. supports → relevance_score, per Trigger aus demand_arguments gepflegt
ALTER TABLE demands RENAME COLUMN supports TO relevance_score;

CREATE OR REPLACE FUNCTION recount_relevance()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  target uuid := COALESCE(NEW.demand_id, OLD.demand_id);
BEGIN
  UPDATE demands
    SET relevance_score = (SELECT COUNT(*) FROM demand_arguments WHERE demand_id = target)
    WHERE id = target;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS demand_arguments_relevance ON demand_arguments;
CREATE TRIGGER demand_arguments_relevance
  AFTER INSERT OR UPDATE OR DELETE ON demand_arguments
  FOR EACH ROW EXECUTE FUNCTION recount_relevance();

-- 3. Likes auf einzelne Bürgerbeiträge
CREATE TABLE demand_argument_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  argument_id uuid REFERENCES demand_arguments(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(argument_id, user_id)
);

ALTER TABLE demand_argument_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes öffentlich lesbar" ON demand_argument_likes FOR SELECT USING (true);
CREATE POLICY "Beitrag liken" ON demand_argument_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Like zurücknehmen" ON demand_argument_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Alte Unterstützungslogik entfernen (durch das Positionsmodell ersetzt)
DROP TABLE IF EXISTS demand_supports;
DROP FUNCTION IF EXISTS increment_supports(uuid);
DROP FUNCTION IF EXISTS decrement_supports(uuid);
