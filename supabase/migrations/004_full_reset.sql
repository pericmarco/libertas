-- ─────────────────────────────────────────
-- VOLLSTÄNDIGER RESET — löscht ALLE Nutzerkonten und ALLE bisherigen
-- Inhalte (auch Demo-/Referenzdaten wie Politiker, Themen, News).
-- districts / regions / district_demographics bleiben unangetastet
-- (siehe 002_koeln_innenstadt.sql).
--
-- UNWIDERRUFLICH. Vor Ausführung sicherstellen dass wirklich alle
-- aktuellen Accounts — auch die eigenen — gelöscht werden sollen.
-- Nach dem Reset: normal über /register neu anmelden, danach die
-- Rollen-Zuweisung am Ende dieser Datei ausführen.
-- ─────────────────────────────────────────

BEGIN;

DELETE FROM demand_arguments;
DELETE FROM demand_supports;
DELETE FROM comments;
DELETE FROM vote_responses;
DELETE FROM demand_responses;
DELETE FROM vote_options;
DELETE FROM votes;
DELETE FROM demands;
DELETE FROM topics;
DELETE FROM politicians;
DELETE FROM news;
DELETE FROM profiles;
DELETE FROM auth.users;

COMMIT;

-- ─────────────────────────────────────────
-- Nach dem Reset: neu über /register registrieren, dann diese zwei
-- Zeilen mit den echten E-Mail-Adressen ausführen, um Admin-Rechte
-- zu vergeben.
-- ─────────────────────────────────────────

-- UPDATE profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'founder@example.com');

-- UPDATE profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'cofounder@example.com');
