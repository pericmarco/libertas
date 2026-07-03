-- ─────────────────────────────────────────
-- Fix: "Unterstützen"-Toggle bricht nach dem ersten Klick
--
-- Ursache: demand_supports hat INSERT + SELECT Policies und einen
-- UNIQUE(demand_id, user_id) Constraint, aber KEINE DELETE Policy.
-- Der Delete-Call beim Zurücknehmen einer Unterstützung wird von RLS
-- still blockiert (0 betroffene Zeilen, kein Fehler). Beim erneuten
-- Unterstützen schlägt der Insert dann am UNIQUE-Constraint fehl,
-- weil die alte Zeile nie gelöscht wurde.
-- ─────────────────────────────────────────

CREATE POLICY "Unterstützung zurücknehmen" ON demand_supports
  FOR DELETE USING (auth.uid() = user_id);
