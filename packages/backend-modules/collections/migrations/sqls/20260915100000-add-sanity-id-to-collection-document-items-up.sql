-- Sanity-backed bookmarks/progress get their own column instead of borrowing
-- "repoId": that column is a FK to publikator.repos (see publikator's
-- 20210520082541-repoid-as-foreignkey), so a Sanity _id can never live there.
-- Both columns may be set on the same row (see
-- migrate-legacy-collection-items.ts): a migrated legacy item keeps its
-- repoId -- so old, repoId-only queries keep seeing it unchanged -- and
-- gains sanityId alongside it, so the new Sanity-oriented queries see it
-- too. Only a genuinely Sanity-native row (no legacy equivalent) is ever
-- repoId-less; a row is never both-null.
--
-- Written idempotently (IF NOT EXISTS / DROP ... IF EXISTS before re-adding):
-- staging already ran an earlier version of this migration with a stricter
-- "exactly one" check, under filenames that no longer exist now that this
-- migration replaces them outright rather than following up after them --
-- db-migrate only knows a migration by its filename, so from its perspective
-- this file has never run anywhere, and must produce the right end state
-- whether the table already has this column/constraint/index or not.
ALTER TABLE "collectionDocumentItems"
  ADD COLUMN IF NOT EXISTS "sanityId" text,
  ALTER COLUMN "repoId" DROP NOT NULL;

-- NOT VALID: this table is written on essentially every article view, and a
-- plain `ADD CONSTRAINT ... CHECK (...)` would hold an ACCESS EXCLUSIVE lock
-- for as long as it takes to scan and validate every existing row. NOT VALID
-- skips that scan (metadata-only, instant); the scan itself happens in the
-- next migration instead, under a lighter lock. See
-- ...-validate-sanity-id-check-up.sql.
ALTER TABLE "collectionDocumentItems"
  DROP CONSTRAINT IF EXISTS "collectionDocumentItems_one_document_ref";
ALTER TABLE "collectionDocumentItems"
  ADD CONSTRAINT "collectionDocumentItems_one_document_ref"
    CHECK (num_nonnulls("repoId", "sanityId") >= 1) NOT VALID;

-- The pre-existing unique("collectionId", "userId", "repoId") still guards
-- publikator rows, but is inert for Sanity ones: NULL "repoId" values are
-- NULLS DISTINCT, so it would happily accept the same bookmark twice. This
-- partial index is the Sanity-side equivalent.
CREATE UNIQUE INDEX IF NOT EXISTS "collection_document_items_collection_user_sanity_id_key"
  ON "collectionDocumentItems" ("collectionId", "userId", "sanityId")
  WHERE "sanityId" IS NOT NULL;
