ALTER TABLE tokens
  DROP COLUMN "expireAction",
  DROP COLUMN "context"
;

DROP DOMAIN token_expire_action;
