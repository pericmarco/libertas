-- ─────────────────────────────────────────
-- BEISPIEL-Einträge fürs Politiker-Verzeichnis
--
-- Hintergrund: 004_full_reset.sql leert u. a. `politicians` (DELETE FROM
-- politicians), und die ursprüngliche Seed-Zeile stand nur in schema.sql.
-- Dadurch war das Verzeichnis leer. Diese Migration legt ein paar klar als
-- BEISPIEL gekennzeichnete Einträge an, damit die Seite Inhalt hat und der
-- Ablauf (Liste, Detail, Kontakt-Maskierung) prüfbar ist.
--
-- → Sobald ihr echte Mandatsträger:innen über Admin → Politiker anlegt,
--   könnt ihr diese Beispiele dort einfach löschen. E-Mails sind bewusst
--   @beispiel.koeln (existiert nicht) und keine echten Personen-Daten.
--
-- idempotent: bei erneutem Ausführen werden die Beispiele zunächst entfernt.
-- ─────────────────────────────────────────

DELETE FROM politicians WHERE email LIKE '%@beispiel.koeln';

INSERT INTO politicians (name, party, role, constituency, topics, bio, email, phone, website, contact_public, verified, response_rate)
VALUES
  (
    'Sarah Beispiel', 'SPD', 'Ratsmitglied', 'Bezirksvertretung Innenstadt',
    ARRAY['Wohnen','ÖPNV','Soziales'],
    'Beispiel-Eintrag. Setzt sich für bezahlbaren Wohnraum und einen besseren Nahverkehr in der Innenstadt ein.',
    'sarah.beispiel@beispiel.koeln', '+49 221 0000001', 'https://beispiel.koeln/sarah',
    true, true, 72
  ),
  (
    'Thomas Beispiel', 'CDU', 'Ratsherr', 'Bezirksvertretung Innenstadt',
    ARRAY['Wirtschaft','Sicherheit'],
    'Beispiel-Eintrag. Schwerpunkte auf lokaler Wirtschaftsförderung und öffentlicher Sicherheit.',
    'thomas.beispiel@beispiel.koeln', '+49 221 0000002', NULL,
    false, false, 48       -- contact_public=false → E-Mail/Telefon müssen im Verzeichnis maskiert sein
  ),
  (
    'Lena Beispiel', 'GRÜNE', 'Bezirksvertreterin', 'Bezirksvertretung Innenstadt',
    ARRAY['Umwelt','Radverkehr','Klima'],
    'Beispiel-Eintrag. Engagiert für Radinfrastruktur, mehr Grün und konsequenten Klimaschutz vor Ort.',
    'lena.beispiel@beispiel.koeln', NULL, 'https://beispiel.koeln/lena',
    true, true, 91
  );
