ALTER TABLE "membershipTypes"
  -- "intervalCount" is replaced by "defaultPeriods"
  DROP COLUMN "intervalCount",

  -- Describes number periods
  ADD COLUMN "minPeriods" int NOT NULL DEFAULT 1,
  ADD COLUMN "maxPeriods" int NOT NULL DEFAULT 1,
  ADD COLUMN "defaultPeriods" int NOT NULL DEFAULT 1,

  -- Sanity checks for interval count settings
  ADD CONSTRAINT "membershipTypes_minPeriods_check"
    CHECK ("minPeriods" <= "maxPeriods"),
  ADD CONSTRAINT "membershipTypes_maxPeriods_check"
    CHECK ("maxPeriods" >= "minPeriods"),
  ADD CONSTRAINT "membershipTypes_defaultPeriods_lowerBound_check"
    CHECK ("defaultPeriods" <= "maxPeriods"),
  ADD CONSTRAINT "membershipTypes_defaultPeriods_upperBound_check"
    CHECK ("defaultPeriods" >= "minPeriods")
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
  ADD COLUMN "order" int NOT NULL DEFAULT 100,
  ADD COLUMN "group" character varying DEFAULT 'ME'
;

UPDATE "packages" SET "order"=100 WHERE "name"='PROLONG' ;
UPDATE "packages" SET "order"=200 WHERE "name"='ABO' ;
UPDATE "packages" SET "order"=300 WHERE "name"='MONTHLY_ABO' ;
UPDATE "packages" SET "order"=400 WHERE "name"='BENEFACTOR' ;
UPDATE "packages" SET "order"=500, "group"='GIVE' WHERE "name"='ABO_GIVE' ;
UPDATE "packages" SET "order"=700 WHERE "name"='DONATE' ;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "periods" int
;

ALTER TABLE "memberships"
  ADD COLUMN "initialInterval" "intervalType" DEFAULT 'year',
  ADD COLUMN "initialPeriods" int DEFAULT 1
;

UPDATE "memberships" SET "initialInterval" = 'month'
FROM "pledges", "packages"
WHERE
  "memberships"."pledgeId" = "pledges"."id"
  AND "pledges"."packageId" = "packages"."id"
  AND "packages"."name" = 'MONTHLY_ABO'
;

ALTER TABLE "memberships"
  ALTER COLUMN "initialInterval" DROP DEFAULT,
  ALTER COLUMN "initialPeriods" DROP DEFAULT,
  ALTER COLUMN "initialInterval" SET NOT NULL,
  ALTER COLUMN "initialPeriods" SET NOT NULL
;
