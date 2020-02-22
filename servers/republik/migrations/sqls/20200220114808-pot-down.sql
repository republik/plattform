ALTER TABLE "memberships"
  DROP COLUMN "accessGranted"
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
