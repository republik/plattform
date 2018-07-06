ALTER TABLE tokens
  DROP CONSTRAINT "tokens_type_check",
  ADD CONSTRAINT "tokens_type_check" CHECK(type IN ('EMAIL_TOKEN', 'TOTP', 'SMS', 'APP'))
;
