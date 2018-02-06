drop table if exists "tokens";

ALTER TABLE users
  DROP COLUMN "isTwoFactorEnabled",
  DROP COLUMN "twoFactorSecret",
  DROP COLUMN "tempTwoFactorSecret"
;
