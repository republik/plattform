CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE "mailLog" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "type"            character varying not null,
  "userId"          uuid references "users" on update cascade on delete set null,
  "email"           citext not null,
  "membershipIds"   uuid[],
  "info"            jsonb,
  "resultOk"        boolean,
  "resultPayload"   jsonb,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now()
);
