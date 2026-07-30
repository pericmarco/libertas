-- ─────────────────────────────────────────
-- Multi-City Schritt 5: Musterstadt als zweite Stadt
--
-- Zweck:
--   a) Vertrieb — eine jederzeit vorzeigbare Demo-Instanz unter eigener
--      Adresse (musterstadt.lybertas.de), die wie ein fertiges Produkt wirkt
--      und unter EIGENEM Namen läuft (White-Label-Beweis).
--   b) Technischer Nachweis — erst mit einer zweiten Stadt lässt sich zeigen,
--      dass sich die Daten wirklich nicht vermischen.
--
-- Die Musterstadt ist bewusst `status = 'demo'` und `is_listed = false`:
-- sie ist erreichbar, taucht aber in keiner öffentlichen Städteliste auf.
-- ─────────────────────────────────────────

-- 1) Stadt anlegen — inkl. eigener Marke und Farbe (White-Label sichtbar)
INSERT INTO cities (slug, name, state, status, is_listed, brand_name, primary_color, show_powered_by, population)
VALUES (
  'musterstadt', 'Musterstadt', 'Nordrhein-Westfalen',
  'demo', false,
  'Musterstadt beteiligt',      -- statt „Lybertas"
  '#0F766E',                    -- eigenes Grün-Blau, klar abweichend von Köln
  true,
  120000
)
ON CONFLICT (slug) DO NOTHING;

-- 2) Gebiet + Stadtteile der Musterstadt
INSERT INTO regions (name, city, state, city_id)
SELECT 'Musterstadt Zentrum', 'Musterstadt', 'Nordrhein-Westfalen', c.id
FROM cities c WHERE c.slug = 'musterstadt'
  AND NOT EXISTS (SELECT 1 FROM regions r WHERE r.name = 'Musterstadt Zentrum');

INSERT INTO districts (name, city, state, population, region_id, city_id)
SELECT d.name, 'Musterstadt', 'Nordrhein-Westfalen', d.population, r.id, c.id
FROM (VALUES
  ('Altstadt',     18000),
  ('Nordviertel',  24000),
  ('Südviertel',   21000)
) AS d(name, population)
CROSS JOIN cities c
JOIN regions r ON r.name = 'Musterstadt Zentrum'
WHERE c.slug = 'musterstadt'
  AND NOT EXISTS (
    SELECT 1 FROM districts x WHERE x.name = d.name AND x.city_id = c.id
  );

-- 3) Beispiel-Forderungen (klar als Demo erkennbar, ohne Konto-Bezug)
INSERT INTO demands (title, description, category, status, district_id, city_id, user_id, relevance_score)
SELECT v.title, v.description, v.category, v.status, dist.id, c.id, NULL, v.score
FROM (VALUES
  ('Mehr Sitzbänke im Stadtpark',
   'Beispiel-Anliegen der Demo-Instanz: Im Stadtpark fehlen Sitzgelegenheiten, besonders für ältere Menschen.',
   'Freizeit', 'eingereicht', 'Altstadt', 34),
  ('Sicherer Schulweg an der Hauptstraße',
   'Beispiel-Anliegen der Demo-Instanz: Der Übergang vor der Grundschule ist unübersichtlich.',
   'Sicherheit', 'geprüft', 'Nordviertel', 61),
  ('Bessere Taktung der Buslinie 4',
   'Beispiel-Anliegen der Demo-Instanz: Abends fährt die Linie nur stündlich.',
   'Verkehr', 'eingereicht', 'Südviertel', 27)
) AS v(title, description, category, status, district_name, score)
CROSS JOIN cities c
JOIN districts dist ON dist.name = v.district_name AND dist.city_id = c.id
WHERE c.slug = 'musterstadt'
  AND NOT EXISTS (
    SELECT 1 FROM demands x WHERE x.title = v.title AND x.city_id = c.id
  );

-- 4) Beispiel-Mandatsträger:innen der Musterstadt
INSERT INTO politicians (name, party, role, constituency, topics, bio, email, contact_public, verified, response_rate, city_id)
SELECT v.name, v.party, v.role, 'Rat der Musterstadt', v.topics, v.bio,
       NULL, false, true, v.rate, c.id
FROM (VALUES
  ('Anna Muster',   'SPD',   'Ratsmitglied',
   ARRAY['Wohnen','Soziales'],
   'Beispiel-Eintrag der Demo-Instanz.', 68),
  ('Bernd Beispiel','CDU',   'Ratsmitglied',
   ARRAY['Wirtschaft','Verkehr'],
   'Beispiel-Eintrag der Demo-Instanz.', 54),
  ('Clara Demo',    'GRÜNE', 'Ratsmitglied',
   ARRAY['Umwelt','Klima'],
   'Beispiel-Eintrag der Demo-Instanz.', 83)
) AS v(name, party, role, topics, bio, rate)
CROSS JOIN cities c
WHERE c.slug = 'musterstadt'
  AND NOT EXISTS (
    SELECT 1 FROM politicians x WHERE x.name = v.name AND x.city_id = c.id
  );
