INSERT INTO "collections" ("name", "hidden") VALUES ('progress', true);

ALTER TABLE "collectionDocumentItems"
  ADD COLUMN "updatedAt" timestamptz default now()
;

CREATE TABLE "collectionMediaItems" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "collectionId"    uuid not null references "collections" on update cascade,
  "userId"          uuid not null references "users" on update cascade on delete set null,
  "mediaId"         text not null,
  "data"            jsonb,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  unique("collectionId", "userId", "mediaId")
);

CREATE INDEX IF NOT EXISTS "collection_document_items_collection_id_idx" ON "collectionDocumentItems"("collectionId");
CREATE INDEX IF NOT EXISTS "collection_document_items_repo_id_idx" ON "collectionDocumentItems"("repoId");
CREATE INDEX IF NOT EXISTS "collection_document_items_user_id_idx" ON "collectionDocumentItems"("userId");

CREATE INDEX IF NOT EXISTS "collection_media_items_collection_id_idx" ON "collectionMediaItems"("collectionId");
CREATE INDEX IF NOT EXISTS "collection_media_items_media_id_idx" ON "collectionMediaItems"("mediaId");
CREATE INDEX IF NOT EXISTS "collection_media_items_user_id_idx" ON "collectionMediaItems"("userId");
