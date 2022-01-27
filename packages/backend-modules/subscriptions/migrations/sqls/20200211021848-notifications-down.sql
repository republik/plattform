DROP TABLE "notifications";
DROP TABLE "events";

ALTER TABLE "subscriptions"
  DROP COLUMN "active"
;
