ALTER TABLE "membershipTypes"
  ADD COLUMN "minIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "maxIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "defaultIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "intervalStepCount" int NOT NULL DEFAULT 1,
  ADD CONSTRAINT "membershipTypes_minIntervalCount_check"
    CHECK ("minIntervalCount" <= "maxIntervalCount"),
  ADD CONSTRAINT "membershipTypes_maxIntervalCount_check"
    CHECK ("maxIntervalCount" >= "minIntervalCount"),
  ADD CONSTRAINT "membershipTypes_defaultIntervalCount_check"
    CHECK ("defaultIntervalCount" <= "maxIntervalCount"),
  ADD CONSTRAINT "membershipTypes_intervalStepCount_check"
    CHECK ("intervalStepCount" <= "maxIntervalCount")
;

UPDATE "membershipTypes"
  SET
    "minIntervalCount"=1,
    "maxIntervalCount"=1,
    "defaultIntervalCount"=1,
    "intervalStepCount"=1
  WHERE
    "name"='MONTHLY_ABO'
;

ALTER TABLE "packageOptions"
  ADD COLUMN "intervalStepCountPrice" integer DEFAULT 0,
  ADD COLUMN "order" int NOT NULL DEFAULT 100
;

UPDATE "packageOptions"
  SET
    "intervalStepCountPrice"="price"
;

ALTER TABLE "packages"
  ADD COLUMN "order" int NOT NULL DEFAULT 100
;

UPDATE "packages" SET "order"=100 WHERE "name"='ABO' ;
UPDATE "packages" SET "order"=200 WHERE "name"='MONTHLY_ABO' ;
UPDATE "packages" SET "order"=300 WHERE "name"='BENEFACTOR' ;
UPDATE "packages" SET "order"=400 WHERE "name"='ABO_GIVE' ;
UPDATE "packages" SET "order"=500 WHERE "name"='INTERVAL_ABO_GIVE' ;
UPDATE "packages" SET "order"=600 WHERE "name"='DONATE' ;
