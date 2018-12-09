ALTER TABLE "membershipTypes"
  -- "intervalCount" is replaced by "defaultIntervalCount"
  DROP COLUMN "intervalCount",

  -- Describes what interval count is allowed
  ADD COLUMN "minIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "maxIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "defaultIntervalCount" int NOT NULL DEFAULT 1,
  ADD COLUMN "intervalStepCount" int NOT NULL DEFAULT 1,

  -- Sanity checks for interval count settings
  ADD CONSTRAINT "membershipTypes_minIntervalCount_check"
    CHECK ("minIntervalCount" <= "maxIntervalCount"),
  ADD CONSTRAINT "membershipTypes_maxIntervalCount_check"
    CHECK ("maxIntervalCount" >= "minIntervalCount"),
  ADD CONSTRAINT "membershipTypes_defaultIntervalCount_lowerBound_check"
    CHECK ("defaultIntervalCount" <= "maxIntervalCount"),
  ADD CONSTRAINT "membershipTypes_defaultIntervalCount_upperBound_check"
    CHECK ("defaultIntervalCount" >= "minIntervalCount"),
  ADD CONSTRAINT "membershipTypes_intervalStepCount_check"
    CHECK ("intervalStepCount" <= "maxIntervalCount"),
  ADD CONSTRAINT "membershipTypes_intervalStepCount_moduloMaxIntervalCount_check"
    CHECK ("maxIntervalCount" % "intervalStepCount" = 0),
  ADD CONSTRAINT "membershipTypes_intervalStepCount_moduloMinIntervalCount_check"
    CHECK ("minIntervalCount" % "intervalStepCount" = 0),
  ADD CONSTRAINT "membershipTypes_intervalStepCount_moduloDefaultIntervalCount_check"
    CHECK ("defaultIntervalCount" % "intervalStepCount" = 0)
;

ALTER TABLE "packageOptions"
  ADD COLUMN "order" int NOT NULL DEFAULT 100
;

ALTER TABLE "packages"
  ADD COLUMN "order" int NOT NULL DEFAULT 100
;

UPDATE "packages" SET "order"=100 WHERE "name"='ABO' ;
UPDATE "packages" SET "order"=200 WHERE "name"='MONTHLY_ABO' ;
UPDATE "packages" SET "order"=300 WHERE "name"='BENEFACTOR' ;
UPDATE "packages" SET "order"=400 WHERE "name"='ABO_GIVE' ;
UPDATE "packages" SET "order"=600 WHERE "name"='DONATE' ;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "intervalCount" int
;

ALTER TABLE "memberships"
  ADD COLUMN "initialInterval" "intervalType",
  ADD COLUMN "initialIntervalCount" int
;

-- Temporary disable all triggers, limited to this session
SET session_replication_role = replica;

UPDATE "memberships"
SET
  "initialInterval" = "interval",
  "initialIntervalCount" = "defaultIntervalCount"
FROM
  "membershipTypes"
WHERE
  "memberships"."membershipTypeId" = "membershipTypes"."id"
;

-- Renable triggers
SET session_replication_role = DEFAULT;
