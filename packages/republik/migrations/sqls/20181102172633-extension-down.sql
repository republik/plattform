ALTER TABLE "pledgeOptions"
  DROP COLUMN IF EXISTS "autoPay",
  DROP COLUMN IF EXISTS "membershipId",
  DROP COLUMN IF EXISTS "id",
  ADD CONSTRAINT "pledgeOptions_pkey" PRIMARY KEY ("templateId", "pledgeId")
;

ALTER TABLE "membershipPeriods"
  DROP COLUMN IF EXISTS "kind",
  DROP COLUMN IF EXISTS "pledgeId"
;

ALTER TABLE "memberships"
  DROP COLUMN IF EXISTS "autoPay"
;

ALTER TABLE "packages"
  DROP COLUMN IF EXISTS "custom",
  DROP COLUMN IF EXISTS "rules"
;
