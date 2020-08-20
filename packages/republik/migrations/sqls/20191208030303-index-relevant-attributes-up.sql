CREATE INDEX "membershipPeriods_beginDate_idx" ON "public"."membershipPeriods"("beginDate");
CREATE INDEX "membershipPeriods_endDate_idx" ON "public"."membershipPeriods"("endDate");

CREATE INDEX "packageOptions_packageId_idx" ON "public"."packageOptions"("packageId");
CREATE INDEX "packageOptions_rewardId_idx" ON "public"."packageOptions"("rewardId");

CREATE INDEX "pledgeOptions_templateId_idx" ON "public"."pledgeOptions"("templateId");
CREATE INDEX "pledgeOptions_membershipId_idx" ON "public"."pledgeOptions"("membershipId");
CREATE INDEX "pledgeOptions_amount_idx" ON "public"."pledgeOptions"("amount");

CREATE INDEX "pledges_donation_idx" ON "public"."pledges"("donation");

CREATE INDEX "payments_status_idx" ON "public"."payments"("status");
CREATE INDEX "payments_total_idx" ON "public"."payments"("total");
CREATE INDEX "payments_createdAt_idx" ON "public"."payments"("createdAt");
