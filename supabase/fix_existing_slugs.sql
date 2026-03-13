-- Fix existing slugs that have spaces or uppercase letters
UPDATE case_studies 
SET slug = lower(trim(regexp_replace(slug, '\s+', '-', 'g'))) 
WHERE slug LIKE '% %' OR slug ~ '[A-Z]';

-- Ensure all current slugs are URL friendly
UPDATE case_studies 
SET slug = regexp_replace(regexp_replace(lower(slug), '[^a-z0-9-]+', '', 'g'), '-+', '-', 'g');
