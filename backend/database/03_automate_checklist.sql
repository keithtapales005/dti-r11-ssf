-- STEP 3: the document checklist becomes automatic.
-- Run this once, as a whole, after 02_standardize_schema.sql. One transaction: all or nothing.
--
-- Before: an admin typed free-text document names per project.
-- After : every project has exactly one checklist row per required document type
--         (document_type.is_required = true). The backend keeps the rows in sync.
--
-- Rows that were typed by hand and do not match a required document type are NOT lost:
-- they are copied into project_document_checklist_legacy before being removed.

BEGIN;

-- 1. keep a copy of the old checklist
CREATE TABLE project_document_checklist_legacy AS TABLE project_document_checklist;
ALTER TABLE project_document_checklist_legacy ENABLE ROW LEVEL SECURITY;

-- 2. link each row to a document type
ALTER TABLE project_document_checklist ADD COLUMN document_type_id smallint;

UPDATE project_document_checklist c
   SET document_type_id = d.document_type_id
  FROM document_type d
 WHERE d.is_required
   AND lower(btrim(c.document_name)) = lower(btrim(d.name));

-- hand-typed rows that match no required document are only kept in the legacy table
DELETE FROM project_document_checklist WHERE document_type_id IS NULL;

-- if a project had the same document twice, keep the one furthest along (Verified > Uploaded > Pending)
DELETE FROM project_document_checklist c
 USING (
   SELECT checklist_id,
          row_number() OVER (
            PARTITION BY project_id, document_type_id
            ORDER BY (SELECT s.sort_order FROM checklist_status s WHERE s.checklist_status_id = status_id) DESC,
                     checklist_id
          ) AS rn
     FROM project_document_checklist
 ) x
 WHERE c.checklist_id = x.checklist_id AND x.rn > 1;

ALTER TABLE project_document_checklist
  DROP COLUMN document_name,
  DROP COLUMN file_id,                      -- files now point to their document type instead
  ALTER COLUMN document_type_id SET NOT NULL,
  ADD CONSTRAINT fk_checklist_document_type FOREIGN KEY (document_type_id) REFERENCES document_type (document_type_id),
  ADD CONSTRAINT uq_checklist_project_document UNIQUE (project_id, document_type_id);

-- 3. every existing project gets a row for every required document
INSERT INTO project_document_checklist (project_id, document_type_id, status_id)
SELECT p.project_id, d.document_type_id,
       (SELECT checklist_status_id FROM checklist_status WHERE name = 'Pending')
  FROM project p
 CROSS JOIN document_type d
 WHERE p.deleted_at IS NULL AND d.is_required AND d.is_active
ON CONFLICT (project_id, document_type_id) DO NOTHING;

-- 4. a document that already has a file is at least "Uploaded"
UPDATE project_document_checklist c
   SET status_id = (SELECT checklist_status_id FROM checklist_status WHERE name = 'Uploaded')
 WHERE c.status_id = (SELECT checklist_status_id FROM checklist_status WHERE name = 'Pending')
   AND EXISTS (SELECT 1 FROM files f
                WHERE f.project_id = c.project_id
                  AND f.document_type_id = c.document_type_id
                  AND f.deleted_at IS NULL);

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Check afterwards: every project should have the same number of rows (the number of required documents)
-- SELECT project_id, count(*) FROM project_document_checklist GROUP BY project_id ORDER BY 2;
