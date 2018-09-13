CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table "elections" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "slug"        varchar not null,
  "description" varchar not null,
  "beginDate"   timestamptz not null,
  "endDate"     timestamptz not null,
  "numSeats"    integer not null,
  "result"       jsonb,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now(),
  unique("id", "slug")
);

create table "electionCandidacies" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "userId"      uuid not null references "users", -- no cascade to preserve voting record
  "electionId"  uuid not null references "elections" on update cascade on delete cascade,
  "commentId"   uuid not null references "comments",
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

create table "electionBallots" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "userId"      uuid not null references "users", -- no cascade to preserve voting record
  "candidacyId" uuid not null references "electionCandidacies", -- no cascade to preserve voting record
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);
