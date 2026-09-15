-- Sanity-only rows (no repoId to fall back on) get dropped; dual-key rows
-- (backfilled from a legacy repoId, see migrate-legacy-collection-items.ts)
-- just lose "sanityId" and survive via "repoId" untouched, below.
DELETE FROM "collectionDocumentItems"
  WHERE "sanityId" IS NOT NULL AND "repoId" IS NULL;

DROP INDEX IF EXISTS "collection_document_items_collection_user_sanity_id_key";

ALTER TABLE "collectionDocumentItems"
  DROP CONSTRAINT IF EXISTS "collectionDocumentItems_one_document_ref",
  ALTER COLUMN "repoId" SET NOT NULL,
  DROP COLUMN "sanityId";
