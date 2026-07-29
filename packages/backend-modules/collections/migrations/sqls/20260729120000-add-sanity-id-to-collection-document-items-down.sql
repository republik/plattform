-- Sanity-only rows have no "repoId" to fall back on, and restoring the
-- NOT NULL would fail on them — drop them first.
DELETE FROM "collectionDocumentItems"
  WHERE "sanityId" IS NOT NULL;

DROP INDEX IF EXISTS "collection_document_items_collection_user_sanity_id_key";

ALTER TABLE "collectionDocumentItems"
  DROP CONSTRAINT IF EXISTS "collectionDocumentItems_one_document_ref",
  ALTER COLUMN "repoId" SET NOT NULL,
  DROP COLUMN "sanityId";
