-- STEP 1 of 2: safety copy. Run this first, on its own.
-- Copies every table in "public" into a schema called backup_20261022.
-- The copy is only for rollback. Drop it once you have checked the migration:
--   DROP SCHEMA backup_20261022 CASCADE;

CREATE SCHEMA IF NOT EXISTS backup_20261022;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('CREATE TABLE backup_20261022.%I AS TABLE public.%I', t, t);
  END LOOP;
END $$;

-- How many tables were copied (should equal the number of tables you have)
SELECT count(*) AS tables_backed_up FROM pg_tables WHERE schemaname = 'backup_20261022';
