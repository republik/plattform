DROP INDEX IF EXISTS "collection_document_items_collection_id_idx";
DROP INDEX IF EXISTS "collection_document_items_repo_id_idx";
DROP INDEX IF EXISTS "collection_document_items_user_id_idx";

DROP INDEX IF EXISTS "collection_media_items_collection_id_idx";
DROP INDEX IF EXISTS "collection_media_items_media_id_idx";
DROP INDEX IF EXISTS "collection_media_items_user_id_idx";

DELETE FROM "collections" WHERE name = 'progress';

ALTER TABLE "collectionDocumentItems"
  DROP COLUMN IF EXISTS "updatedAt"
;

DROP TABLE "collectionMediaItems";
