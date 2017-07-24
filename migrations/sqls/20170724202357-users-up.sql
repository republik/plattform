CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

create table "users" (
  "id"                  uuid primary key not null default uuid_generate_v4(),
  "email"               citext not null unique,
  "verified"            boolean not null default false,
  "firstName"           text,
  "lastName"            text,
  "githubAccessToken"   text,
  "githubScope"         text,
  "createdAt"           timestamptz default now(),
  "updatedAt"           timestamptz default now()
);
