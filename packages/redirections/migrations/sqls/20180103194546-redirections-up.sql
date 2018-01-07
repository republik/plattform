CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create table "redirections" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "source"              text not null,
  "target"              text not null,
  "status"              integer not null default 301,
  "resource"            jsonb,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  "deletedAt"           timestamptz,
  UNIQUE("source", 'deletedAt')
);
create index "redirections_source_idx" on "redirections" using GIN ("source" gin_trgm_ops);
create index "redirections_target_idx" on "redirections" using GIN ("target" gin_trgm_ops);
create index "redirections_resource_tags_idx" ON "redirections" using GIN ("resource");
