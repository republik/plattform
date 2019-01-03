CREATE TABLE "documentLists" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "name"            text not null unique,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE TABLE "documentListItems" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "documentListId"  uuid not null references "documentLists" on update cascade,
  "userId"          uuid not null references "users" on update cascade on delete set null,
  "repoId"          text not null unique,
  "createdAt"       timestamptz default now()
);
