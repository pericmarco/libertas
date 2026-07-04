-- ─────────────────────────────────────────
-- Phase 7: Dashboard-Modul „Anstehende Wahlen" (Protokoll #10)
--
-- election_date  = fester Termin (Countdown möglich)
-- expected_year  = nur voraussichtliches Jahr (kein genauer Termin)
-- ─────────────────────────────────────────

CREATE TABLE elections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  election_date date,
  expected_year integer,
  description   text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Öffentlich lesbar" ON elections FOR SELECT USING (true);

INSERT INTO elections (title, election_date, expected_year, description) VALUES
  ('Wahl der Seniorenvertretung Köln', '2026-11-23', NULL,
    'Wahl der Interessenvertretung älterer Bürgerinnen und Bürger in Köln.'),
  ('Landtagswahl Nordrhein-Westfalen', '2027-04-25', NULL,
    'Wahl des Landtags NRW. Für Köln relevant bei Themen wie Wohnen, Bildung, Verkehr, Sicherheit, Wirtschaft und Digitalisierung.'),
  ('Bundestagswahl', NULL, 2029,
    'Wahl des Deutschen Bundestages. Genaue Termine werden später festgelegt.'),
  ('Europawahl', NULL, 2029,
    'Wahl des Europäischen Parlaments.'),
  ('Kommunalwahl Köln', NULL, 2030,
    'Wahl von Rat, Bezirksvertretungen und Oberbürgermeisteramt.');
