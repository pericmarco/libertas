-- ─────────────────────────────────────────
-- Phase 6: Sponsor Surveys (Protokoll #8 + #9)
--
-- - Abstimmen zählt vote_options.count + votes.total_votes automatisch
--   (Trigger, SECURITY DEFINER — votes/vote_options haben keine
--   UPDATE-Policy für normale Nutzer).
-- - Repräsentativitäts-Score einer Umfrage: fremde vote_responses sind
--   per RLS nicht lesbar, daher liefert eine SECURITY-DEFINER-Funktion
--   nur die anonymen Demografie-Merkmale der Teilnehmenden (ohne zu
--   verraten, wer was gewählt hat).
-- - Zwei Test-Umfragen von Lybertas als Sponsor.
-- ─────────────────────────────────────────

-- Optionsbeschreibungen (die 5 Antwortoptionen haben je einen Erklärtext)
ALTER TABLE vote_options ADD COLUMN IF NOT EXISTS description text;

-- Stimmen zählen
CREATE OR REPLACE FUNCTION recount_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.vote_id, OLD.vote_id);
BEGIN
  UPDATE vote_options o
    SET count = (SELECT COUNT(*) FROM vote_responses r WHERE r.option_id = o.id)
    WHERE o.vote_id = target;
  UPDATE votes
    SET total_votes = (SELECT COUNT(*) FROM vote_responses r WHERE r.vote_id = target)
    WHERE id = target;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS vote_responses_recount ON vote_responses;
CREATE TRIGGER vote_responses_recount
  AFTER INSERT OR UPDATE OR DELETE ON vote_responses
  FOR EACH ROW EXECUTE FUNCTION recount_votes();

-- Anonyme Demografie der Teilnehmenden für den Repräsentativitäts-Score
CREATE OR REPLACE FUNCTION vote_participant_demographics(v_id uuid)
RETURNS TABLE(age_group text, gender text, district_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.age_group, p.gender, p.district_id
  FROM vote_responses vr
  JOIN profiles p ON p.id = vr.user_id
  WHERE vr.vote_id = v_id;
$$;

-- ─────────────────────────────────────────
-- Test-Umfrage 1: Olympia in Köln
-- ─────────────────────────────────────────
WITH v AS (
  INSERT INTO votes (title, description, is_partner_vote, partner_name)
  VALUES (
    'Olympia in Köln: Was muss jetzt Priorität haben?',
    'Köln hat sich grundsätzlich für die Beteiligung an der Olympia-Bewerbung KölnRheinRuhr ausgesprochen. Jetzt stellt sich die Frage, worauf Stadt, Politik und Verwaltung besonders achten müssen, damit Olympia für Köln ein Gewinn wird.',
    true, 'Lybertas'
  )
  RETURNING id
)
INSERT INTO vote_options (vote_id, label, description)
SELECT v.id, x.label, x.description FROM v, (VALUES
  ('Kostenkontrolle und Transparenz', 'Die Stadt soll offen zeigen, welche Kosten entstehen und wie finanzielle Risiken begrenzt werden.'),
  ('Verkehr und Infrastruktur verbessern', 'Olympia soll genutzt werden, um ÖPNV, Wege, Bahnhöfe und Mobilität in Köln langfristig zu verbessern.'),
  ('Wohnraum schützen und Verdrängung vermeiden', 'Die Olympia-Planung soll sicherstellen, dass keine zusätzlichen Mietbelastungen entstehen und bestehender Wohnraum nicht verdrängt wird.'),
  ('Bestehende Sportstätten nutzen statt neu bauen', 'Köln soll möglichst nachhaltig planen und vorhandene Anlagen modernisieren, statt große Neubauten zu starten.'),
  ('Bürger bei den nächsten Planungsschritten beteiligen', 'Nach dem Bürgerentscheid sollen Bürger auch bei Standort-, Verkehrs-, Kosten- und Stadtentwicklungsfragen regelmäßig einbezogen werden.')
) AS x(label, description);

-- ─────────────────────────────────────────
-- Test-Umfrage 2: Landtagswahl NRW 2027
-- ─────────────────────────────────────────
WITH v AS (
  INSERT INTO votes (title, description, is_partner_vote, partner_name, ends_at)
  VALUES (
    'Welche Themen sollten Kölner Kandidierende zur Landtagswahl NRW 2027 priorisieren?',
    'Am 25. April 2027 findet die nächste Landtagswahl in Nordrhein-Westfalen statt. Auch für Köln sind landespolitische Entscheidungen wichtig, zum Beispiel bei Wohnen, Bildung, Verkehr, Sicherheit und Digitalisierung. Diese Umfrage soll sichtbar machen, welche Themen Kölner Bürger vor der Wahl besonders wichtig finden.',
    true, 'Lybertas', '2027-04-25 00:00:00+02'
  )
  RETURNING id
)
INSERT INTO vote_options (vote_id, label, description)
SELECT v.id, x.label, NULL FROM v, (VALUES
  ('Bezahlbarer Wohnraum und Mieterschutz'),
  ('Verkehr, ÖPNV und Baustellenmanagement'),
  ('Bildung, Schulen und Kitas'),
  ('Sicherheit und Sauberkeit im öffentlichen Raum'),
  ('Wirtschaft, Bürokratieabbau und Digitalisierung')
) AS x(label);
