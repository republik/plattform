DROP TABLE IF EXISTS "devices";

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "hadDevice"
;
