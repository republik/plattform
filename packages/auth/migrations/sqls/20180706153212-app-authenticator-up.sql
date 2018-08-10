CREATE DOMAIN token_type AS TEXT
CHECK(
  VALUE IN ('EMAIL_TOKEN', 'TOTP', 'SMS', 'APP')
);

ALTER TABLE tokens
  DROP CONSTRAINT "tokens_type_check",
  ALTER COLUMN "type" TYPE token_type
;

ALTER TABLE users
  ADD COLUMN "preferredFirstFactor" token_type
;

