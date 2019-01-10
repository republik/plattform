CREATE TABLE "collections" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "name"            text not null unique,
  "hidden"          boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE TABLE "collectionDocumentItems" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "collectionId"    uuid not null references "collections" on update cascade,
  "userId"          uuid not null references "users" on update cascade on delete set null,
  "repoId"          text not null,
  "data"            jsonb,
  "createdAt"       timestamptz default now(),
  unique("collectionId", "userId", "repoId")
);

INSERT INTO "collections" ("name") VALUES ('bookmarks');
