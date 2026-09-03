-- ═══════════════════════════════════════════════════════════════════════
-- LYBERTAS · Beispiel-Inhalte für Köln (Demo/„gelebt"-Eindruck)
--
-- Was dieses Skript tut:
--   1. löscht die bestehenden Köln-Forderungen (inkl. Positionen/Kommentaren),
--   2. legt einige Demo-Nutzerkonten an (für realistische Diskussionen),
--   3. erstellt 6 Beispiel-Forderungen (teils vom Besitzer-Konto, teils von
--      den Demo-Nutzern) mit Ort/Koordinaten,
--   4. fügt Positionen (Unterstützung/Gegenargument/Alternative) mit Text
--      als Diskussion hinzu,
--   5. setzt die Relevanzpunkte auf ansehnliche Demo-Werte.
--
-- AUSFÜHRUNG: im Supabase-SQL-Editor (Service-Role → umgeht RLS). Idempotent:
--   erneutes Ausführen räumt die Köln-Forderungen weg und setzt sie neu;
--   die Demo-Nutzer werden nur angelegt, falls noch nicht vorhanden.
--
-- ‼️ VOR DEM AUSFÜHREN: unten die E-Mail deines eigenen Login-Kontos eintragen
--    (v_owner_email), damit ein Teil der Forderungen dir zugeordnet wird.
-- ‼️ Löscht ALLE aktuellen Köln-Forderungen — bewusst so gewünscht.
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_owner_email text := 'HIER-DEINE-LOGIN-EMAIL@example.com';  -- <<<<<< ANPASSEN
  v_owner uuid;
  v_city  uuid;
  v_inst  uuid := '00000000-0000-0000-0000-000000000000';
  demo    record;
  u_jeck uuid; u_radler uuid; u_maus uuid; u_dom uuid; u_sev uuid;
  fid uuid;
BEGIN
  -- ── Besitzer + Stadt auflösen ─────────────────────────────────────────
  SELECT id INTO v_owner FROM auth.users WHERE lower(email) = lower(v_owner_email);
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Kein Konto mit E-Mail % gefunden — bitte v_owner_email oben anpassen.', v_owner_email;
  END IF;
  SELECT id INTO v_city FROM cities WHERE slug = 'koeln';
  IF v_city IS NULL THEN RAISE EXCEPTION 'Stadt koeln nicht gefunden.'; END IF;

  -- ── 1) Bestehende Köln-Forderungen entfernen (Cascade räumt Beiträge) ──
  DELETE FROM demands WHERE city_id = v_city;

  -- ── 2) Demo-Nutzer anlegen (Profile entstehen per handle_new_user-Trigger)
  FOR demo IN
    SELECT * FROM (VALUES
      ('koelner_jeck',      'Altstadt/Süd'),
      ('rheinradlerin',     'Neustadt/Nord'),
      ('veedel_maus',       'Deutz'),
      ('domblick',          'Altstadt/Nord'),
      ('severins_bewohner', 'Neustadt/Süd')
    ) AS t(username, district)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = demo.username || '@demo.lybertas.local') THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        gen_random_uuid(), v_inst, 'authenticated', 'authenticated',
        demo.username || '@demo.lybertas.local',
        extensions.crypt('lybertas-demo', extensions.gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object(
          'username', demo.username,
          'city_slug', 'koeln',
          'district_id', (SELECT id::text FROM districts WHERE city_id = v_city AND name = demo.district),
          'terms_accepted', 'true',
          'consent_version', '1'
        ),
        '', '', '', ''
      );
    END IF;
  END LOOP;

  SELECT id INTO u_jeck   FROM auth.users WHERE email = 'koelner_jeck@demo.lybertas.local';
  SELECT id INTO u_radler FROM auth.users WHERE email = 'rheinradlerin@demo.lybertas.local';
  SELECT id INTO u_maus   FROM auth.users WHERE email = 'veedel_maus@demo.lybertas.local';
  SELECT id INTO u_dom    FROM auth.users WHERE email = 'domblick@demo.lybertas.local';
  SELECT id INTO u_sev    FROM auth.users WHERE email = 'severins_bewohner@demo.lybertas.local';

  -- ── 3+4) Forderungen + Diskussionen ───────────────────────────────────

  -- (1) Ampel Mediapark — Besitzer
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Zu lange Rotphasen an der Ampel vor der Brücke zum Mediapark',
    'Immer wenn ich zur Uni gehe, stehe ich zu lange an der Ampel, da es unglaublich lange dauert, bis sie für Fußgänger und Radfahrer grün wird. In der Hauptverkehrszeit staut sich der Fußverkehr, viele gehen bei Rot – das ist gefährlich.',
    'Die Grünphase für Fuß- und Radverkehr verlängern und die Schaltung an die tatsächlichen Wege anpassen.',
    'Verkehr & Mobilität', 'Neustadt/Nord', 'stadtteil', 'eingereicht',
    v_owner, v_city, 50.9490, 6.9430, now() - interval '2 hours'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, u_radler, 'unterstützend', 'Die Ampelphase ist besonders morgens deutlich zu lang.', now() - interval '1 hour'),
    (fid, u_dom,    'unterstützend', 'Als Fußgänger wartet man ewig – das lädt regelrecht zum Bei-Rot-Gehen ein.', now() - interval '50 minutes'),
    (fid, u_maus,   'gegenargument', 'Eine längere Grünphase könnte den Autoverkehr auf der Inneren Kanalstraße stärker zurückstauen.', now() - interval '40 minutes'),
    (fid, u_jeck,   'alternative',   'Ein zusätzlicher Bedarfstaster wäre eine schnelle Zwischenlösung, bis die Schaltung neu geplant ist.', now() - interval '30 minutes'),
    (fid, u_sev,    'unterstützend', NULL, now() - interval '20 minutes');
  UPDATE demands SET relevance_score = 18 WHERE id = fid;

  -- (2) Sichere Radwege Altstadt — koelner_jeck
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Mehr sichere Radwege in der Altstadt',
    'In der Altstadt enden viele Radwege im Nichts, und man landet mitten im Autoverkehr. Gerade für Familien mit Kindern ist das eine echte Gefahr.',
    'Durchgehende, baulich getrennte Radwege auf den Hauptachsen der Altstadt.',
    'Verkehr & Mobilität', 'Altstadt/Süd', 'stadtteil', 'geprüft',
    u_jeck, v_city, 50.9376, 6.9600, now() - interval '1 day'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, v_owner, 'unterstützend', 'Volle Unterstützung – ich meide die Altstadt mit dem Rad komplett.', now() - interval '20 hours'),
    (fid, u_radler,'unterstützend', 'Sichere Radwege bringen mehr Menschen aufs Rad. Gut fürs Klima und die Luft.', now() - interval '18 hours'),
    (fid, u_dom,   'alternative',   'Zunächst Tempo 20 und Fahrradstraßen einrichten – das ginge schneller als Umbauten.', now() - interval '12 hours'),
    (fid, u_maus,  'unterstützend', NULL, now() - interval '10 hours');
  UPDATE demands SET relevance_score = 34 WHERE id = fid;

  -- (3) Grünflächen Rheinufer — Besitzer
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Mehr Grünflächen und Bäume am Rheinufer',
    'Das Rheinufer in der Altstadt ist im Sommer sehr aufgeheizt. Ein paar mehr Bäume und Grünflächen würden für Schatten und Aufenthaltsqualität sorgen.',
    'Zusätzliche Bäume, Grünstreifen und schattige Sitzgelegenheiten entlang der Uferpromenade.',
    'Umwelt & Sauberkeit', 'Altstadt/Süd', 'stadtteil', 'eingereicht',
    v_owner, v_city, 50.9330, 6.9640, now() - interval '2 days'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, u_sev,   'unterstützend', 'Im Sommer hält man es dort kaum aus – mehr Schatten wäre großartig.', now() - interval '40 hours'),
    (fid, u_jeck,  'unterstützend', 'Bäume kühlen die Stadt und sind gut fürs Mikroklima.', now() - interval '36 hours'),
    (fid, u_maus,  'gegenargument', 'Es sollte genug Platz für Feste und Märkte am Ufer bleiben.', now() - interval '30 hours');
  UPDATE demands SET relevance_score = 27 WHERE id = fid;

  -- (4) Bezahlbarer Wohnraum — severins_bewohner
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Bezahlbarer Wohnraum in der Neustadt',
    'Die Mieten im Severinsviertel steigen immer weiter. Viele, die hier aufgewachsen sind, können sich das Veedel nicht mehr leisten.',
    'Mehr geförderten Wohnungsbau und wirksamen Schutz vor Verdrängung.',
    'Wohnen', 'Neustadt/Süd', 'stadtteil', 'eingereicht',
    u_sev, v_city, 50.9230, 6.9430, now() - interval '3 days'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, v_owner, 'unterstützend', 'Ein riesiges Thema – ohne bezahlbaren Wohnraum verliert das Veedel seine Mischung.', now() - interval '60 hours'),
    (fid, u_dom,   'unterstützend', 'Betrifft längst nicht nur die Neustadt, sondern die ganze Innenstadt.', now() - interval '52 hours'),
    (fid, u_radler,'alternative',   'Leerstand und Zweckentfremdung konsequenter angehen wäre kurzfristig wirksam.', now() - interval '44 hours');
  UPDATE demands SET relevance_score = 41 WHERE id = fid;

  -- (5) Beleuchtung Ebertplatz — Besitzer (in Bearbeitung)
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Bessere Beleuchtung am Ebertplatz',
    'Abends ist der Ebertplatz an einigen Ecken sehr dunkel. Eine hellere, gleichmäßigere Beleuchtung würde das Sicherheitsgefühl deutlich verbessern.',
    'Moderne, blendfreie LED-Beleuchtung an den dunklen Bereichen und Durchgängen.',
    'Sicherheit & Ordnung', 'Altstadt/Nord', 'stadtteil', 'bearbeitet',
    v_owner, v_city, 50.9490, 6.9530, now() - interval '5 days'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, u_dom,   'unterstützend', 'Als Anwohnerin meide ich abends bestimmte Ecken – mehr Licht hilft sofort.', now() - interval '4 days'),
    (fid, u_jeck,  'unterstützend', NULL, now() - interval '3 days'),
    (fid, u_maus,  'unterstützend', 'Gute Beleuchtung ist eine der günstigsten Maßnahmen mit großer Wirkung.', now() - interval '2 days');
  UPDATE demands SET relevance_score = 22 WHERE id = fid;

  -- (6) Sitzbänke Rheinpark Deutz — veedel_maus
  INSERT INTO demands (title, description, solution, category, location, location_scope, status, user_id, city_id, lat, lng, created_at)
  VALUES (
    'Mehr Sitzbänke im Rheinpark',
    'Im Rheinpark auf der Deutzer Seite gibt es zu wenige Sitzmöglichkeiten. Ältere Menschen und Familien brauchen häufiger eine Pause.',
    'Zusätzliche Bänke entlang der Hauptwege, gerne mit Blick auf den Rhein.',
    'Stadtentwicklung & öffentlicher Raum', 'Deutz', 'stadtteil', 'eingereicht',
    u_maus, v_city, 50.9410, 6.9720, now() - interval '4 days'
  ) RETURNING id INTO fid;
  INSERT INTO demand_arguments (demand_id, user_id, type, text, created_at) VALUES
    (fid, u_sev,   'unterstützend', 'Mit kleinen Kindern ist jede zusätzliche Bank Gold wert.', now() - interval '3 days'),
    (fid, v_owner, 'unterstützend', NULL, now() - interval '2 days');
  UPDATE demands SET relevance_score = 12 WHERE id = fid;

  RAISE NOTICE 'Köln-Demo-Inhalte gesetzt: 6 Forderungen, Demo-Nutzer + Diskussionen.';
END $$;
