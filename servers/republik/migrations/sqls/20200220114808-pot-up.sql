ALTER TABLE "memberships"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false
;

ALTER TABLE "packageOptions"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false,
  ADD COLUMN "potPledgeOptionId" uuid references "pledgeOptions"(id)
;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false,
  ADD COLUMN "potPledgeOptionId" uuid references "pledgeOptions"(id),
  ADD COLUMN "total" int
;
