ALTER TABLE "accessCampaigns"
  ADD COLUMN "emailRecommendations" interval
;

ALTER TABLE "accessGrants"
  ADD COLUMN "recommendationsAt" timestamp with time zone
;
