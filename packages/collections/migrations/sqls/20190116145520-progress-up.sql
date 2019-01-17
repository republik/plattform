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
