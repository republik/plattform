CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

create table "addresses" (
  "id"          uuid primary key not null default uuid_generate_v4(),
  "name"        varchar not null,
  "line1"       varchar not null,
  "line2"       varchar,
  "postalCode"  varchar not null,
  "city"        varchar not null,
  "country"     varchar not null,
  "createdAt"   timestamptz default now(),
  "updatedAt"   timestamptz default now()
);

create table "users" (
  "id"             uuid primary key not null default uuid_generate_v4(),
  "email"          citext not null unique,
  "verified"       boolean not null default false,
  "firstName"      text,
  "lastName"       text,
  "birthday"       date,
  "phoneNumber"    text,
  "addressId"      uuid references "addresses" on update cascade on delete cascade,
  "roles"          jsonb,
  "facebookId"     text,
  "twitterHandle"  text,
  "publicUrl"      text,
  "isEmailPublic"  boolean not null default false,
  "isPrivate"      boolean not null default false,
  "createdAt"      timestamptz default now(),
  "updatedAt"      timestamptz default now(),
  "badges"         jsonb,
);

create index "users_firstName_idx" on "users" using GIN ("firstName" gin_trgm_ops);
create index "users_lastName_idx" on "users" using GIN ("lastName" gin_trgm_ops);
