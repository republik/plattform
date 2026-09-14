-- Sanity-backed bookmarks/progress get their own column instead of borrowing
-- "repoId": that column is a FK to publikator.repos (see publikator's
-- 20210520082541-repoid-as-foreignkey), so a Sanity _id can never live there.
-- Both columns coexist so content can migrate to Sanity piecemeal without
-- touching existing rows.

-- Added NOT VALID: this table is written on essentially every article view,
-- and a plain `ADD CONSTRAINT ... CHECK (...)` would hold an ACCESS EXCLUSIVE
-- lock for as long as it takes to scan and validate every existing row.
-- NOT VALID skips that scan (metadata-only, instant). The validation scan
-- itself runs in the *next* migration instead of right here: db-migrate
-- wraps this whole file in one BEGIN/COMMIT (see db-migrate-pg's
-- startMigration), so a `VALIDATE CONSTRAINT` in this same file would still
-- run under the ACCESS EXCLUSIVE lock this ALTER TABLE already holds for the
-- transaction's duration -- it only gets the lighter, concurrent-friendly
-- SHARE UPDATE EXCLUSIVE lock by committing this transaction first and
-- validating in a separate one. See ...-validate-sanity-id-check-up.sql.
ALTER TABLE "collectionDocumentItems"
  ADD COLUMN "sanityId" text,
  ALTER COLUMN "repoId" DROP NOT NULL,
  ADD CONSTRAINT "collectionDocumentItems_one_document_ref"
    CHECK (num_nonnulls("repoId", "sanityId") = 1) NOT VALID;

-- The pre-existing unique("collectionId", "userId", "repoId") still guards
-- publikator rows, but is inert for Sanity ones: NULL "repoId" values are
-- NULLS DISTINCT, so it would happily accept the same bookmark twice. This
-- partial index is the Sanity-side equivalent.
CREATE UNIQUE INDEX "collection_document_items_collection_user_sanity_id_key"
  ON "collectionDocumentItems" ("collectionId", "userId", "sanityId")
  WHERE "sanityId" IS NOT NULL;
