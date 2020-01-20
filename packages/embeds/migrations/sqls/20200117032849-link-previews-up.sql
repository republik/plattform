CREATE TABLE "linkPreviews" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "url"         citext not null unique,
  "hostname"    text not null,
  "content"     jsonb not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
)
