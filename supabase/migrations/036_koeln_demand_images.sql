-- ─────────────────────────────────────────
-- Titelbilder für drei Köln-Forderungen
--
-- Ordnet den passenden bestehenden Forderungen ein Bild zu (Match über
-- markante Titelbestandteile, auf Köln beschränkt). Die Bilddateien liegen
-- unter /public/koeln/. Selbstheilend: legt die Spalte an, falls Migration
-- 035 noch nicht eingespielt wurde.
-- ─────────────────────────────────────────

ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS image_urls text[];

UPDATE public.demands d
SET image_urls = ARRAY['/koeln/ampel-mediapark.jpg']
WHERE d.city_id = (SELECT id FROM public.cities WHERE slug = 'koeln')
  AND d.title ILIKE '%Mediapark%';

UPDATE public.demands d
SET image_urls = ARRAY['/koeln/radwege-altstadt.jpg']
WHERE d.city_id = (SELECT id FROM public.cities WHERE slug = 'koeln')
  AND d.title ILIKE '%Radweg%'
  AND d.title ILIKE '%Altstadt%';

UPDATE public.demands d
SET image_urls = ARRAY['/koeln/gruen-rheinufer.jpg']
WHERE d.city_id = (SELECT id FROM public.cities WHERE slug = 'koeln')
  AND d.title ILIKE '%Rheinufer%';
