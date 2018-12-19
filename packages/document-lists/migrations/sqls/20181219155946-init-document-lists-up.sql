CREATE TABLE "documentLists" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "name"            text,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);

CREATE TABLE "documentListItem" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "documentListId"  uuid references "documentLists" on update cascade,
  "userId"          uuid references "users" on update cascade on delete set null,
  "repoId"          text not null unique,
  "createdAt"       timestamptz default now()
);
