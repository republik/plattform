ALTER TABLE tokens
  DROP COLUMN "expireAction"
;

DROP DOMAIN token_expire_action;
