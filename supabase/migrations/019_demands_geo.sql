-- ─────────────────────────────────────────
-- Block: Kartenfunktion (Änderungsprotokoll App-Weiterentwicklung, Abschnitt 2)
--
-- Forderungen können einen konkreten Ort auf der Karte tragen. Für den
-- MVP: ein Punkt (lat/lng) bzw. mehrere Punkte (locations als JSON-Liste
-- von {lat, lng}). Alles additiv und nullbar — bestehende Forderungen und
-- Daten bleiben unverändert.
--
-- Die Koordinaten werden beim Einreichen (INSERT) mitgeschrieben; es gibt
-- bewusst weiterhin keine breite UPDATE-Policy für Autoren auf demands.
-- ─────────────────────────────────────────

ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS lat       double precision,
  ADD COLUMN IF NOT EXISTS lng       double precision,
  ADD COLUMN IF NOT EXISTS locations jsonb,
  ADD COLUMN IF NOT EXISTS address   text;

-- Schneller Bounding-Box-Filter für die Kartenansicht (nur verortete Forderungen)
CREATE INDEX IF NOT EXISTS idx_demands_lat_lng
  ON demands (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;
