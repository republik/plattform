CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table "gsheets" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "name"          "text" not null,
  "data"          jsonb not null,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now(),
  unique ("name")
);
