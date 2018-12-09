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

-- Assign "membershipType" package options order 100
UPDATE "packageOptions"
SET
  "order" = 100
FROM
  "rewards"
WHERE
  "rewards"."id" = "packageOptions"."rewardId"
  AND "rewards"."type" = 'MembershipType'
;

-- Assign goodies in package options order 200 (notebooks), 300 (totebags)
UPDATE "packageOptions"
SET
  "order" = CASE
    WHEN "goodies"."name" = 'NOTEBOOK' THEN 200
    WHEN "goodies"."name" = 'TOTEBAG' THEN 300
    ELSE 400
  END
FROM
  "rewards",
  "goodies"
WHERE
  "rewards"."id" = "packageOptions"."rewardId"
  AND "rewards"."type" = 'Goodie'
  AND "goodies"."rewardId" = "rewards"."id"
;

ALTER TABLE "packages"
  ADD COLUMN "order" int NOT NULL DEFAULT 100
;

UPDATE "packages" SET "order"=100 WHERE "name"='PROLONG' ;
UPDATE "packages" SET "order"=200 WHERE "name"='ABO' ;
UPDATE "packages" SET "order"=300 WHERE "name"='MONTHLY_ABO' ;
UPDATE "packages" SET "order"=400 WHERE "name"='BENEFACTOR' ;
UPDATE "packages" SET "order"=500 WHERE "name"='ABO_GIVE' ;
UPDATE "packages" SET "order"=700 WHERE "name"='DONATE' ;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "intervalCount" int
;

ALTER TABLE "memberships"
  ADD COLUMN "initialInterval" "intervalType",
  ADD COLUMN "initialIntervalCount" int
;

-- Temporary disable all triggers.
ALTER TABLE "memberships" DISABLE TRIGGER "trigger_member_role";
ALTER TABLE "memberships" DISABLE TRIGGER "trigger_voucher_code";
ALTER TABLE "memberships" DISABLE TRIGGER "trigger_associate_role";
ALTER TABLE "memberships" DISABLE TRIGGER "trigger_revoke_membership_cancellations";

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
ALTER TABLE "memberships" ENABLE TRIGGER "trigger_revoke_membership_cancellations";
ALTER TABLE "memberships" ENABLE TRIGGER "trigger_associate_role";
ALTER TABLE "memberships" ENABLE TRIGGER "trigger_voucher_code";
ALTER TABLE "memberships" ENABLE TRIGGER "trigger_member_role";
