ALTER DOMAIN token_type
  DROP CONSTRAINT token_type_check
;

ALTER DOMAIN token_type
  ADD CONSTRAINT token_type_check
  CHECK(
    VALUE IN ('EMAIL_TOKEN', 'EMAIL_CODE', 'AUTHORIZE_TOKEN', 'TOTP', 'SMS', 'APP')
  )
;
