INSERT INTO "collections" ("name", "hidden") VALUES ('progress', true);

ALTER TABLE "collectionDocumentItems"
  ADD COLUMN "updatedAt" timestamptz default now()
;
