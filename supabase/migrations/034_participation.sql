-- ─────────────────────────────────────────
-- Beteiligungsverfahren in Network
--
-- Städte/Verwaltung (und verifizierte Politik) können echte Beteiligungs-
-- verfahren anlegen — dieselbe Tiefe wie im Musterstadt-Portal, aber mitten
-- im sozialen Netzwerk. Bürger:innen sehen und nutzen sie über den Feed und
-- den „Mitmachen"-Bereich.
--
-- Diese Migration legt den Verfahrens-Container an. Die einzelnen Modul-Inhalte
-- (Kartenbeiträge, Umfrage-Stimmen …) werden – wie bisher in Musterstadt –
-- schrittweise persistiert; der Container selbst ist ab jetzt echt.
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.participation_processes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id       uuid REFERENCES public.cities(id) ON DELETE CASCADE,
  district_id   uuid REFERENCES public.districts(id) ON DELETE SET NULL,

  title         text NOT NULL,
  subtitle      text,
  description   text,

  status        text NOT NULL DEFAULT 'beteiligung_laeuft'
    CHECK (status IN ('beteiligung_laeuft','in_auswertung','geplant','umsetzung','abgeschlossen')),
  -- aktivierte Module: information, ideen, karte, umfrage, varianten, fragen,
  -- buergerbudget, dokument, termine, ergebnisse
  modules       text[] NOT NULL DEFAULT '{information}',
  reaction_mode text NOT NULL DEFAULT 'sca'
    CHECK (reaction_mode IN ('support','sca','comments','none')),
  results_mode  text NOT NULL DEFAULT 'nach'
    CHECK (results_mode IN ('live','nach','verwaltung')),

  department    text,
  contact       text,
  area          text,               -- Anzeige-Ort/Stadtteil (frei)

  starts_at     date,
  ends_at       date,
  image_url     text,
  lat           double precision,
  lng           double precision,

  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS participation_city_idx ON public.participation_processes (city_id, created_at DESC);

-- Stadt automatisch aus dem Kontext (wie andere Inhalte)
DROP TRIGGER IF EXISTS participation_set_city ON public.participation_processes;
CREATE TRIGGER participation_set_city BEFORE INSERT ON public.participation_processes
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();

ALTER TABLE public.participation_processes ENABLE ROW LEVEL SECURITY;

-- Lesen: öffentlich
CREATE POLICY "Verfahren öffentlich lesbar" ON public.participation_processes
  FOR SELECT USING (true);

-- Erstellen: nur offizielle Publisher (Stadt/Admin/verifizierte Politik)
CREATE POLICY "Offizielle erstellen Verfahren" ON public.participation_processes
  FOR INSERT WITH CHECK (public.is_official_publisher());

-- Ändern / Löschen: Ersteller:in oder Admin
CREATE POLICY "Ersteller oder Admin ändern Verfahren" ON public.participation_processes
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "Ersteller oder Admin löschen Verfahren" ON public.participation_processes
  FOR DELETE USING (created_by = auth.uid() OR public.is_admin());

GRANT SELECT ON public.participation_processes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.participation_processes TO authenticated;

-- ─────────────────────────────────────────
-- Beispiel-Verfahren NUR für Demo-Städte (status='demo'). Module bewusst nur
-- {information, karte}, damit die Detailseite ohne Platzhalter voll funktioniert.
-- Koordinaten grob Köln (Innenstadt) als Kartenmittelpunkt.
-- ─────────────────────────────────────────
INSERT INTO public.participation_processes
  (city_id, title, subtitle, description, status, modules, reaction_mode, results_mode, department, contact, area, starts_at, ends_at, lat, lng)
SELECT c.id, x.title, x.subtitle, x.description, 'beteiligung_laeuft', ARRAY['information','karte']::text[], 'sca', 'live',
       x.department, x.contact, x.area, current_date, current_date + 45, x.lat, x.lng
FROM public.cities c
CROSS JOIN (VALUES
  ('Neugestaltung des Rheinufers',
   'Wo wünschen Sie sich mehr Aufenthaltsqualität am Wasser?',
   'Das Rheinufer soll attraktiver werden — mehr Grün, Sitzgelegenheiten und sichere Wege. Markieren Sie auf der Karte, wo Sie Verbesserungen wünschen, und bringen Sie Ihre Ideen ein.',
   'Stadtplanungsamt', 'Frau Dr. Vogt', 'Innenstadt', 50.9385, 6.9600),
  ('Sicherer Radverkehr in der Südstadt',
   'Wo ist Radfahren gefährlich oder unangenehm?',
   'Für ein sicheres Radnetz in der Südstadt sammeln wir Ihre Ortskenntnis: Markieren Sie Gefahrenstellen, fehlende Wege und gute Beispiele auf der Karte.',
   'Amt für Verkehr', 'Herr Sommer', 'Südstadt', 50.9200, 6.9550)
) AS x(title, subtitle, description, department, contact, area, lat, lng)
WHERE c.status = 'demo';
