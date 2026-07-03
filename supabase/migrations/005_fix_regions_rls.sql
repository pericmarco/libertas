-- ─────────────────────────────────────────
-- Fix: regions-Tabelle liefert für anon/authenticated leer zurück
--
-- Supabase aktiviert RLS automatisch für neu angelegte Tabellen.
-- 002_koeln_innenstadt.sql hat "regions" angelegt, aber keine
-- SELECT-Policy dafür gesetzt — RLS blockiert dadurch alle Zeilen
-- statt sie freizugeben (0 Zeilen, kein Fehler).
-- ─────────────────────────────────────────

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Öffentlich lesbar" ON regions FOR SELECT USING (true);
