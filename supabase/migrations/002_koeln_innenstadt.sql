-- ─────────────────────────────────────────
-- Phase 2: Köln Innenstadt als Pilot-Bezirk
--
-- Quellen:
-- - Einwohnerzahlen je Stadtteil: Stadt Köln, "Kölner Stadtteil-
--   informationen – Zahlen 2025, Bevölkerung" (Amt für Stadt-
--   entwicklung und Statistik) – exakte Werte.
-- - Alter/Geschlecht: Stadt Köln, "Kölner Statistische Nachrichten
--   4/2023, Bevölkerung in Köln 2022" – gesamtstädtisch. Amtlich nur
--   grob nach unter 18 / 18–60 / 60+ aufgeschlüsselt; die 6 Gruppen
--   zwischen 18 und 60 sind aus dieser Grobklasse (60,05 %)
--   interpoliert und sollten vor einer offiziellen Präsentation mit
--   dem Amt für Stadtentwicklung und Statistik verifiziert werden.
--   unter 18 (16,2 %), 60–64 (6,0 %), 65+ (17,8 %) sowie die
--   Geschlechterverteilung sind exakte städtische Werte.
-- ─────────────────────────────────────────

CREATE TABLE regions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  city       text NOT NULL,
  state      text NOT NULL DEFAULT 'Nordrhein-Westfalen',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE districts ADD COLUMN region_id uuid REFERENCES regions(id);
ALTER TABLE district_demographics ADD COLUMN region_id uuid REFERENCES regions(id);

INSERT INTO regions (name, city) VALUES ('Köln Innenstadt', 'Köln');

-- Bestehende Stadtteile übernehmen, Namen an Protokoll-Schreibweise
-- angleichen (Schrägstrich statt Bindestrich) und echte Einwohnerzahlen setzen
UPDATE districts SET name = 'Neustadt/Süd', population = 37306,
  region_id = (SELECT id FROM regions WHERE name = 'Köln Innenstadt')
  WHERE name = 'Neustadt-Süd';

UPDATE districts SET name = 'Neustadt/Nord', population = 28923,
  region_id = (SELECT id FROM regions WHERE name = 'Köln Innenstadt')
  WHERE name = 'Neustadt-Nord';

-- Neue Stadtteile
INSERT INTO districts (name, city, population, region_id) VALUES
  ('Altstadt/Süd',  'Köln', 27851, (SELECT id FROM regions WHERE name = 'Köln Innenstadt')),
  ('Altstadt/Nord', 'Köln', 18333, (SELECT id FROM regions WHERE name = 'Köln Innenstadt')),
  ('Deutz',         'Köln', 15476, (SELECT id FROM regions WHERE name = 'Köln Innenstadt'));

-- Lindenthal/Ehrenfeld bleiben unangetastet (region_id NULL) und fallen
-- damit automatisch aus allen Köln-Innenstadt-Abfragen raus.

-- Alte, stadtteil-genaue Demografie-Zielwerte (altes 6er-Bucket-Schema)
-- durch gesamtstädtische Zielwerte auf Region-Ebene ersetzen
DELETE FROM district_demographics;

INSERT INTO district_demographics (region_id, category, label, percentage) VALUES
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', 'unter 18', 16.2),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '18–24',    9.4),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '25–29',    9.9),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '30–34',    9.4),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '35–44',   13.4),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '45–54',   12.5),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '55–59',    5.4),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '60–64',    6.0),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'age_group', '65+',     17.8),

  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'gender', 'weiblich',     51.2),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'gender', 'männlich',     48.8),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'gender', 'divers',        0),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'gender', 'keine Angabe',  0),

  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'stadtteil', 'Altstadt/Süd',  21.8),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'stadtteil', 'Neustadt/Süd',  29.2),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'stadtteil', 'Altstadt/Nord', 14.3),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'stadtteil', 'Neustadt/Nord', 22.6),
  ((SELECT id FROM regions WHERE name = 'Köln Innenstadt'), 'stadtteil', 'Deutz',         12.1);
