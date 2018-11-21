DROP TRIGGER IF EXISTS trigger_revoke_membership_cancellations;

DROP FUNCTION IF EXISTS revoke_membership_cancellations;

ALTER TABLE "memberships"
  ADD COLUMN "cancelReasons" jsonb
;

DROP TABLE IF EXISTS "membershipCancellations";

DROP DOMAIN IF EXISTS cancel_category;
