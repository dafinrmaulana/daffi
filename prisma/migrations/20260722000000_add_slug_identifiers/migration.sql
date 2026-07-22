ALTER TABLE "companies" ADD COLUMN "slug" TEXT;
ALTER TABLE "skills" ADD COLUMN "slug" TEXT;
ALTER TABLE "tags" ADD COLUMN "slug" TEXT;
ALTER TABLE "project_highlights" ADD COLUMN "slug" TEXT;

CREATE OR REPLACE FUNCTION pg_temp.backfill_slug(target_table TEXT, fallback_prefix TEXT)
RETURNS VOID AS $$
DECLARE
  source_row RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  collision_number INTEGER;
  slug_exists BOOLEAN;
BEGIN
  FOR source_row IN EXECUTE format('SELECT "id", "name" FROM %I ORDER BY "id"', target_table) LOOP
    base_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(source_row."name"), '[^a-z0-9]+', '-', 'g'));

    IF base_slug = '' THEN
      base_slug := fallback_prefix || '-' || source_row."id";
    END IF;

    candidate_slug := base_slug;
    collision_number := 0;

    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I WHERE "slug" = $1)', target_table)
        INTO slug_exists
        USING candidate_slug;

      EXIT WHEN NOT slug_exists;

      collision_number := collision_number + 1;
      candidate_slug := base_slug || '-' || source_row."id" ||
        CASE WHEN collision_number = 1 THEN '' ELSE '-' || collision_number END;
    END LOOP;

    EXECUTE format('UPDATE %I SET "slug" = $1 WHERE "id" = $2', target_table)
      USING candidate_slug, source_row."id";
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT pg_temp.backfill_slug('companies', 'company');
SELECT pg_temp.backfill_slug('skills', 'skill');
SELECT pg_temp.backfill_slug('tags', 'tag');
SELECT pg_temp.backfill_slug('project_highlights', 'project-highlight');

ALTER TABLE "companies" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "skills" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "project_highlights" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX "project_highlights_slug_key" ON "project_highlights"("slug");
