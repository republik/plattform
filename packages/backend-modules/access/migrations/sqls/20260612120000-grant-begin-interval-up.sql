ALTER TABLE "accessCampaigns"
  ADD COLUMN "grantBeginInterval" interval
;

ALTER TABLE "accessGrants"
  ADD COLUMN "activatedAt" timestamp with time zone
;

-- backfill: grants that already began count as activated
UPDATE "accessGrants" SET "activatedAt" = "beginAt" WHERE "beginAt" IS NOT NULL;
