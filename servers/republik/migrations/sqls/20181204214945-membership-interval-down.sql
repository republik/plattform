ALTER TABLE "packageOptions"
  DROP COLUMN IF EXISTS "order",
  DROP COLUMN IF EXISTS "intervalStepPrice"
;

ALTER TABLE "packages"
  DROP COLUMN IF EXISTS "order"
;

ALTER TABLE "membershipTypes"
  DROP COLUMN IF EXISTS "minInterval",
  DROP COLUMN IF EXISTS "maxInterval",
  DROP COLUMN IF EXISTS "defaultInterval",
  DROP COLUMN IF EXISTS "intervalStep"
;
