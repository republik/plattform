ALTER TABLE "memberships"
  DROP COLUMN IF EXISTS "initialInterval",
  DROP COLUMN IF EXISTS "initialPeriods"
;

ALTER TABLE "pledgeOptions"
  DROP COLUMN IF EXISTS "intervalCount"
;

ALTER TABLE "packageOptions"
  DROP COLUMN IF EXISTS "order"
;

ALTER TABLE "packages"
  DROP COLUMN IF EXISTS "order",
  DROP COLUMN IF EXISTS "group"
;

ALTER TABLE "membershipTypes"
  ADD COLUMN "intervalCount" int NOT NULL DEFAULT 1,
  DROP COLUMN IF EXISTS "minPeriods",
  DROP COLUMN IF EXISTS "maxPeriods",
  DROP COLUMN IF EXISTS "defaultPeriods"
;
