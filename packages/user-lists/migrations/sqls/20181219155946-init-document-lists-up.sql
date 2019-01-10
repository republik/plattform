CREATE TABLE "userLists" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "name"            text not null unique,
  "hidden"          boolean not null default false,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE TABLE "userListDocumentItems" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "userListId"  uuid not null references "userLists" on update cascade,
  "userId"          uuid not null references "users" on update cascade on delete set null,
  "repoId"          text not null,
  "data"            jsonb,
  "createdAt"       timestamptz default now(),
  unique("userListId", "userId", "repoId")
);

INSERT INTO "userLists" ("name") VALUES ('bookmarks');
