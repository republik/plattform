CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE "tokens" (
  "id"            uuid primary key not null default uuid_generate_v4(),
  "sessionId"     uuid references sessions(id) ON DELETE SET NULL,
  "type"          text NOT NULL CHECK (type IN ('EMAIL_TOKEN', 'TOTP', 'SMS')),
  "payload"       text NOT NULL,
  "email"         citext not null,
  "createdAt"     timestamptz default now(),
  "updatedAt"     timestamptz default now(),
  "expiresAt"     timestamptz NOT NULL
);

ALTER TABLE users
  ADD COLUMN "TOTPChallengeSecret"            text,
  ADD COLUMN "isTOTPChallengeSecretVerified"  boolean not null default false,
  ADD COLUMN "phoneNumberVerificationCode"    text,
  ADD COLUMN "isPhoneNumberVerified"          boolean not null default false,
  ADD COLUMN "enabledSecondFactors"           text[]
;
