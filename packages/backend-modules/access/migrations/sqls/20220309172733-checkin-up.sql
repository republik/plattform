ALTER TABLE "accessCampaigns"
  ADD COLUMN "emailCheckin" interval
;

ALTER TABLE "accessGrants"
  ADD COLUMN "checkinAt" timestamp with time zone
;
