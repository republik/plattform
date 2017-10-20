CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create table "testimonials" (
  "id"                uuid primary key not null default uuid_generate_v4(),
  "userId"            uuid not null references "users" on update cascade on delete cascade,
  "role"              text,
  "quote"             text,
  "video"             jsonb,
  "image"             text not null,
  "smImage"           text,
  "published"         boolean not null default true,
  "adminUnpublished"  boolean not null default false,
  "sequenceNumber"    integer,
  "createdAt"         timestamptz default now(),
  "updatedAt"         timestamptz default now(),
  unique("userId")
);
CREATE index "testimonials_role_idx" on "testimonials" using GIN ("role" gin_trgm_ops);

