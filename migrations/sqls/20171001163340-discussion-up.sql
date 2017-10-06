CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

--create type "permission" as ENUM (
--  'ALLOWED',
--  'ENFORCED',
--  'FORBIDDEN'
--);
--
--create type "nameFormat" as ENUM (
--  'FULL',
--  'FIRST',
--  'LAST',
--  'F_LAST',
--  'INITIALS'
--);
--
--create table "discussionRules" (
--  "id"                  uuid primary key not null default uuid_generate_v4(),
--  "maxLength"           integer,
--  "interval"            integer,
--  "anonymity"           "permission",
--  "profilePicture"      "permission",
--  "allowedNames"        "nameFormat"
--);

create table "discussions" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now()
);

create table "comments" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "discussionId"        uuid not null references "discussions",
  "parentId"            uuid references "comments",
  "userId"              uuid not null references "users",
  "content"             text,
  "upVotes"             integer not null default 0,
  "downVotes"           integer not null default 0,
  "votes"               jsonb not null default '[]',
  "hottnes"             float not null,
  "depth"               integer not null default 0,
  "published"           boolean not null default true,
  "adminUnpublished"    boolean not null default false,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  "deletedAt"           timestamptz default now()
);
