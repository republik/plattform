-- migrate up here: CREATE TABLE...

ALTER TABLE "public"."userCampaignRewards"
  DROP CONSTRAINT "userCampaignRewards_campaignRewardId_fkey",
  ADD CONSTRAINT "userCampaignRewards_campaignRewardId_fkey" FOREIGN KEY ("campaignRewardId") REFERENCES "public"."campaignRewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
