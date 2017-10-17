CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create type "permission" as ENUM (
  'ALLOWED',
  'ENFORCED',
  'FORBIDDEN'
);

create table "discussions" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "title"               text,
  "maxLength"           integer,
  "minInterval"         integer,
  "anonymity"           "permission" not null default 'ALLOWED',
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
  "updatedAt"           timestamptz default now()
);
create index "comments_content_idx" on "comments" using GIN ("content" gin_trgm_ops);
create index "comments_votes_idx" ON "comments" using GIN ("votes");

create table "credentials" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "userId"              uuid not null references "users",
  "description"         text not null,
  "verified"            boolean not null default false,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now(),
  UNIQUE("userId", "description")
);

create table "discussionPreferences" (
  "userId"              uuid not null references "users",
  "discussionId"        uuid not null references "discussions",
  "anonymous"           boolean not null default false,
  "credentialId"        uuid references "credentials",
  PRIMARY KEY ("userId", "discussionId")
);
