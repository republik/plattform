ALTER TABLE "membershipPeriods" DROP COLUMN IF EXISTS "kind" ;
ALTER TABLE "packages" DROP COLUMN IF EXISTS "custom" ;

DROP TABLE IF EXISTS "actions" ;
DROP TABLE IF EXISTS "additionalDaysActions" ;
