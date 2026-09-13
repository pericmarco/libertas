-- ─────────────────────────────────────────
-- Veranstaltungen / Events (Network)
--
-- Öffentliche Termine einer Stadt (Bürgersprechstunden, Infoabende,
-- Ratssitzungen, Feste …). Werden im Feed und im „Heute in deiner Stadt"-Kopf
-- angezeigt. Anlegen dürfen offizielle Accounts: Stadt/Verwaltung, Admin und
-- verifizierte Politik/Parteien. Lesen dürfen alle (auch ohne Login) — die
-- Daten sind öffentlich und enthalten keine personenbezogenen Angaben.
--
-- Stadt-Zuordnung erfolgt serverseitig über denselben Trigger wie bei
-- Forderungen/Umfragen (set_city_id_from_context) — niemand kann Inhalte in
-- eine fremde Stadt schreiben.
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id      uuid REFERENCES public.cities(id) ON DELETE CASCADE,
  district_id  uuid REFERENCES public.districts(id) ON DELETE SET NULL,

  title        text NOT NULL,
  description  text,
  kind         text NOT NULL DEFAULT 'Veranstaltung',  -- Workshop, Infoabend, Ortstermin, Online, Ratssitzung, Fest, Sprechstunde …

  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz,

  location     text,
  address      text,
  online       boolean NOT NULL DEFAULT false,
  organizer    text,
  source_url   text,

  registration boolean NOT NULL DEFAULT false,
  capacity     integer,

  lat          double precision,
  lng          double precision,

  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_city_starts_idx ON public.events (city_id, starts_at);

-- Stadt automatisch aus dem Kontext bestimmen (wie andere Inhalte)
DROP TRIGGER IF EXISTS events_set_city ON public.events;
CREATE TRIGGER events_set_city BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_city_id_from_context();

-- Wer darf offizielle Inhalte veröffentlichen? Stadt/Admin oder verifizierte Politik.
CREATE OR REPLACE FUNCTION public.is_official_publisher()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role IN ('city', 'admin') OR (role = 'politician' AND politician_verified = true))
  );
$$;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Lesen: öffentlich (angemeldet und anonym)
CREATE POLICY "Events öffentlich lesbar" ON public.events
  FOR SELECT USING (true);

-- Erstellen: nur offizielle Publisher
CREATE POLICY "Offizielle erstellen Events" ON public.events
  FOR INSERT WITH CHECK (public.is_official_publisher());

-- Ändern / Löschen: Ersteller:in oder Admin
CREATE POLICY "Ersteller oder Admin ändern Events" ON public.events
  FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "Ersteller oder Admin löschen Events" ON public.events
  FOR DELETE USING (created_by = auth.uid() OR public.is_admin());

GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- ─────────────────────────────────────────
-- Beispiel-Termine NUR für Demo-Städte (status = 'demo'), damit die Funktion
-- in Vorführungen sofort sichtbar ist, ohne echte Städte zu berühren.
-- ─────────────────────────────────────────
INSERT INTO public.events (city_id, title, description, kind, starts_at, ends_at, location, organizer, registration)
SELECT c.id, x.title, x.description, x.kind, x.starts_at, x.ends_at, x.location, x.organizer, x.registration
FROM public.cities c
CROSS JOIN (VALUES
  ('Bürgersprechstunde der Verwaltung',
   'Bringen Sie Ihre Anliegen, Ideen und Fragen direkt zur Stadtverwaltung.',
   'Sprechstunde',
   date_trunc('day', now()) + interval '17 hours',
   date_trunc('day', now()) + interval '19 hours',
   'Rathaus, Zimmer 108', 'Stadtverwaltung', true),
  ('Infoabend Stadtentwicklung',
   'Die Verwaltung stellt aktuelle Planungen vor — mit Raum für Ihre Fragen.',
   'Infoabend',
   date_trunc('day', now()) + interval '5 days' + interval '19 hours',
   date_trunc('day', now()) + interval '5 days' + interval '21 hours',
   'Stadthalle, Saal B', 'Stadtplanungsamt', false),
  ('Öffentliche Ratssitzung',
   'Öffentliche Sitzung des Stadtrats. Die Tagesordnung finden Sie im Ratsinformationssystem.',
   'Ratssitzung',
   date_trunc('day', now()) + interval '12 days' + interval '17 hours',
   date_trunc('day', now()) + interval '12 days' + interval '20 hours',
   'Rathaus, Ratssaal', 'Büro des Bürgermeisters', false)
) AS x(title, description, kind, starts_at, ends_at, location, organizer, registration)
WHERE c.status = 'demo';
