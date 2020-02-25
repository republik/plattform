DROP INDEX "pledge_option_pot_pledge_option_id_idx";

ALTER TABLE "memberships"
  DROP COLUMN "accessGranted",
  DROP COLUMN "potPledgeOptionId"
;

ALTER TABLE "packageOptions"
  DROP COLUMN "accessGranted",
  DROP COLUMN "potPledgeOptionId"
;

ALTER TABLE "pledgeOptions"
  DROP COLUMN "accessGranted",
  DROP COLUMN "potPledgeOptionId",
  DROP COLUMN "total"
;

