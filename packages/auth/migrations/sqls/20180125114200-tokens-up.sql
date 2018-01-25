CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "tokens" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "sessionId"     uuid references "sessions",
  "challengeType" text NOT NULL CHECK (type IN ('EMAIL_TOKEN', 'TOTP')),
  "payload"       text NOT NULL,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now(),
  "expireAt"      timestamptz NOT NULL,
)

ALTER TABLE users
  ADD COLUMN "isTwoFactorEnabled" boolean not null default false,
  ADD COLUMN "twoFactorSecret"    text,
;
