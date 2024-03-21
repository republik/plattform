-- migrate down here: DROP TABLE...
ALTER TABLE "public"."userCampaignRewards"
  DROP CONSTRAINT "userCampaignRewards_campaignRewardId_fkey",
  ADD CONSTRAINT "userCampaignRewards_campaignRewardId_fkey" FOREIGN KEY ("campaignRewardId") REFERENCES "public"."rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
