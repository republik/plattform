CREATE EXTENSION IF NOT EXISTS "citext";

ALTER TABLE users
  ADD COLUMN "username"     citext unique,
  ADD COLUMN "hasPublicProfile"  boolean not null default false
;
