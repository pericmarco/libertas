-- ─────────────────────────────────────────
-- Titelbilder für Stadtumfragen
--
-- Umfragen (votes) können ein Titelbild bekommen. Ordnet zwei bestehenden
-- Köln-Umfragen ein Bild zu (Match über markante Titelbestandteile).
-- Bilder liegen unter /public/koeln/.
-- ─────────────────────────────────────────

ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS image_url text;

UPDATE public.votes v
SET image_url = '/koeln/olympia-koeln.jpg'
WHERE v.city_id = (SELECT id FROM public.cities WHERE slug = 'koeln')
  AND v.title ILIKE '%Olympia%';

UPDATE public.votes v
SET image_url = '/koeln/landtagswahl-nrw-2027.jpg'
WHERE v.city_id = (SELECT id FROM public.cities WHERE slug = 'koeln')
  AND v.title ILIKE '%Landtagswahl%';
