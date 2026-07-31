-- Sanity-backed bookmarks/progress get their own column instead of borrowing
-- "repoId": that column is a FK to publikator.repos (see publikator's
-- 20210520082541-repoid-as-foreignkey), so a Sanity _id can never live there.
-- Both columns coexist so content can migrate to Sanity piecemeal without
-- touching existing rows.

ALTER TABLE "collectionDocumentItems"
  ADD COLUMN "sanityId" text,
  ALTER COLUMN "repoId" DROP NOT NULL,
  ADD CONSTRAINT "collectionDocumentItems_one_document_ref"
    CHECK (num_nonnulls("repoId", "sanityId") = 1);

-- The pre-existing unique("collectionId", "userId", "repoId") still guards
-- publikator rows, but is inert for Sanity ones: NULL "repoId" values are
-- NULLS DISTINCT, so it would happily accept the same bookmark twice. This
-- partial index is the Sanity-side equivalent.
CREATE UNIQUE INDEX "collection_document_items_collection_user_sanity_id_key"
  ON "collectionDocumentItems" ("collectionId", "userId", "sanityId")
  WHERE "sanityId" IS NOT NULL;
