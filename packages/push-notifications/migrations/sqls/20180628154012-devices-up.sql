CREATE TABLE "devices" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "userId"        uuid not null references users(id),
  "sessionId"     uuid not null unique references sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "token"         text unique,
  "information"   jsonb,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now()
);

ALTER TABLE "users"
  ADD COLUMN  "hadDevice" boolean not null default false
;
