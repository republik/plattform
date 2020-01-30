CREATE TABLE "embeds" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "url"         citext not null unique,
  "host"    text not null,
  "type"        text not null,
  "typeId"      text,
  "content"     jsonb not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
)
