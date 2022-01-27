ALTER TABLE "memberships"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false,
  ADD COLUMN "potPledgeOptionId" uuid references "pledgeOptions"(id)
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

ALTER TABLE "pledges"
  ADD COLUMN "messageToClaimers" text
;

CREATE INDEX "pledge_option_pot_pledge_option_id_idx" ON "pledgeOptions"("potPledgeOptionId");
