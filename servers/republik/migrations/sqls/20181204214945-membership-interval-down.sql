ALTER TABLE "memberships"
  DROP COLUMN IF EXISTS "initialInterval",
  DROP COLUMN IF EXISTS "initialIntervalCount"
;

ALTER TABLE "pledgeOptions"
  DROP COLUMN IF EXISTS "intervalCount"
;

ALTER TABLE "packageOptions"
  DROP COLUMN IF EXISTS "order"
;

ALTER TABLE "packages"
  DROP COLUMN IF EXISTS "order"
;

ALTER TABLE "membershipTypes"
  ADD COLUMN "intervalCount" int NOT NULL DEFAULT 1,
  DROP COLUMN IF EXISTS "minIntervalCount",
  DROP COLUMN IF EXISTS "maxIntervalCount",
  DROP COLUMN IF EXISTS "defaultIntervalCount",
  DROP COLUMN IF EXISTS "intervalStepCount"
;
