-- Add postalDelivery flag to packageOptions
ALTER TABLE "packageOptions" ADD COLUMN "postalDelivery" boolean NOT NULL DEFAULT 'false';

-- Update existing packageOptions
-- Set postalDelivery flag to TRUE if reward is a goodie
UPDATE "packageOptions" SET "postalDelivery" = TRUE
WHERE "rewardId" IN (
  SELECT "rewardId" FROM "goodies"
) AND "postalDelivery" = FALSE ;
