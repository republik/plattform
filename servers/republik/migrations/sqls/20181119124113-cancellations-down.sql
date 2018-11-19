DROP TABLE IF EXISTS "membershipCancellations";

DROP DOMAIN IF EXISTS cancel_category;

ALTER TABLE "memberships"
  ADD COLUMN "cancelReasons" jsonb
;
