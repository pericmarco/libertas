-- ─────────────────────────────────────────
-- LIBERTAS – Datenbank Schema
-- Ausführen in: Supabase → SQL Editor → Run
-- ─────────────────────────────────────────

-- Wahlkreise
CREATE TABLE districts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  city        text NOT NULL,
  state       text NOT NULL DEFAULT 'Nordrhein-Westfalen',
  population  integer,
  created_at  timestamptz DEFAULT now()
);

-- Nutzerprofile (verknüpft mit Supabase Auth)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name   text,
  district_id uuid REFERENCES districts(id),
  age_group   text,
  gender      text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- Politiker
CREATE TABLE politicians (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  party         text NOT NULL,
  role          text NOT NULL,
  district_id   uuid REFERENCES districts(id),
  topics        text[],
  response_rate integer DEFAULT 0,
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);

-- Themen / Beschlüsse
CREATE TABLE topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text,
  district_id uuid REFERENCES districts(id),
  status      text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'resolved')),
  created_at  timestamptz DEFAULT now()
);

-- Abstimmungen
CREATE TABLE votes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text,
  district_id         uuid REFERENCES districts(id),
  ends_at             timestamptz,
  total_votes         integer DEFAULT 0,
  representation_score integer DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

-- Abstimmungsoptionen
CREATE TABLE vote_options (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id  uuid REFERENCES votes(id) ON DELETE CASCADE,
  label    text NOT NULL,
  count    integer DEFAULT 0
);

-- Einzelne Stimmen (verhindert Doppelabstimmung)
CREATE TABLE vote_responses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id    uuid REFERENCES votes(id) ON DELETE CASCADE,
  option_id  uuid REFERENCES vote_options(id),
  user_id    uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(vote_id, user_id)
);

-- Bürgerforderungen
CREATE TABLE demands (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text,
  district_id uuid REFERENCES districts(id),
  user_id     uuid REFERENCES auth.users(id),
  supports    integer DEFAULT 0,
  status      text DEFAULT 'eingereicht' CHECK (status IN ('eingereicht','geprüft','bearbeitet','umgesetzt','abgelehnt')),
  created_at  timestamptz DEFAULT now()
);

-- Unterstützungen für Forderungen
CREATE TABLE demand_supports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id  uuid REFERENCES demands(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(demand_id, user_id)
);

-- Kommentare
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id   uuid REFERENCES demands(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- BEISPIELDATEN
-- ─────────────────────────────────────────

INSERT INTO districts (name, city, population) VALUES
  ('Neustadt-Süd', 'Köln', 24800),
  ('Neustadt-Nord', 'Köln', 21300),
  ('Lindenthal', 'Köln', 58000),
  ('Ehrenfeld', 'Köln', 47000);

INSERT INTO politicians (name, party, role, district_id, topics, response_rate)
SELECT 'Sarah Müller', 'SPD', 'Bezirksbürgermeisterin', id, ARRAY['Wohnen','ÖPNV'], 72
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO politicians (name, party, role, district_id, topics, response_rate)
SELECT 'Thomas Becker', 'CDU', 'Ratsherr', id, ARRAY['Wirtschaft','Sicherheit'], 48
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO politicians (name, party, role, district_id, topics, response_rate)
SELECT 'Lena Hoffmann', 'Grüne', 'Bezirksvertreterin', id, ARRAY['Umwelt','Fahrrad'], 91
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO topics (title, description, category, district_id, status)
SELECT 'Radwegausbau Neustadt-Süd', 'Geplanter Ausbau der Radinfrastruktur', 'Verkehr', id, 'active'
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO topics (title, description, category, district_id, status)
SELECT 'Neuer Spielplatz Vorgebirgspark', 'Antrag auf neuen Spielplatz', 'Freizeit', id, 'pending'
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO demands (title, category, district_id, supports, status, user_id)
SELECT 'Mehr Fahrradständer am Barbarossaplatz', 'Verkehr', id, 312, 'bearbeitet', '00000000-0000-0000-0000-000000000000'
FROM districts WHERE name = 'Neustadt-Süd';

INSERT INTO demands (title, category, district_id, supports, status, user_id)
SELECT 'Beleuchtung an der Haltestelle Ulrepforte', 'Sicherheit', id, 198, 'geprüft', '00000000-0000-0000-0000-000000000000'
FROM districts WHERE name = 'Neustadt-Süd';

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Jeder kann lesen
CREATE POLICY "Öffentlich lesbar" ON districts FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON politicians FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON topics FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON votes FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON vote_options FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON demands FOR SELECT USING (true);
CREATE POLICY "Öffentlich lesbar" ON comments FOR SELECT USING (true);

-- Eigenes Profil verwalten
CREATE POLICY "Eigenes Profil lesen" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Eigenes Profil bearbeiten" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profil erstellen" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Forderungen einreichen
CREATE POLICY "Forderungen einreichen" ON demands FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Abstimmen (nur einmal)
CREATE POLICY "Abstimmen" ON vote_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Stimme lesen" ON vote_responses FOR SELECT USING (auth.uid() = user_id);

-- Unterstützen
CREATE POLICY "Unterstützen" ON demand_supports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Unterstützung" ON demand_supports FOR SELECT USING (auth.uid() = user_id);

-- Kommentieren
CREATE POLICY "Kommentieren" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
