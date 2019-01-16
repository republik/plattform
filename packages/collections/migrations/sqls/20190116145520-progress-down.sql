DELETE FROM "collections" WHERE name = 'progress';

ALTER TABLE "collectionDocumentItems"
  DROP COLUMN IF EXISTS "updatedAt"
;
