ALTER TABLE tokens
  ALTER COLUMN "type" TYPE text,
  ADD CONSTRAINT "tokens_type_check" CHECK(type IN ('EMAIL_TOKEN', 'TOTP', 'SMS'))
;

ALTER TABLE  users
 DROP COLUMN "preferredFirstFactor"
;

DROP DOMAIN token_Type;
