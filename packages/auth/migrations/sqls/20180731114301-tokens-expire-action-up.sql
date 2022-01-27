CREATE DOMAIN token_expire_action AS TEXT
CHECK(
  VALUE IN ('authorize', 'deny')
);

ALTER TABLE tokens
  ADD COLUMN "expireAction" token_expire_action,
  ADD COLUMN "context" text
;
