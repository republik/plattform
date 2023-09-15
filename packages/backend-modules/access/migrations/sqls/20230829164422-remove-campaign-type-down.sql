CREATE DOMAIN "campaignType" AS TEXT
  CONSTRAINT "campaignTypeCheck"
    CHECK(
      VALUE IN ('REGULAR', 'REDUCED')
    );


ALTER TABLE "accessCampaigns"
  ADD COLUMN "type" "campaignType" NOT NULL DEFAULT 'REGULAR';
