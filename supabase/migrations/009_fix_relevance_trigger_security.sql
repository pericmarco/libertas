-- ─────────────────────────────────────────
-- Fix: relevance_score wurde nie hochgezählt
--
-- recount_relevance() lief ohne SECURITY DEFINER, also mit den Rechten
-- des aufrufenden Nutzers. Auf demands gibt es keine UPDATE-Policy, also
-- hat RLS das UPDATE in der Funktion still blockiert (0 Zeilen, kein
-- Fehler) — relevance_score blieb auf 0. Die alten RPCs waren genau
-- deshalb SECURITY DEFINER. Nachziehen + bestehende Zählstände backfillen.
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION recount_relevance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.demand_id, OLD.demand_id);
BEGIN
  UPDATE demands
    SET relevance_score = (SELECT COUNT(*) FROM demand_arguments WHERE demand_id = target)
    WHERE id = target;
  RETURN NULL;
END;
$$;

-- Bereits vorhandene Positionen nachträglich korrekt zählen
UPDATE demands d
  SET relevance_score = (SELECT COUNT(*) FROM demand_arguments a WHERE a.demand_id = d.id);
