CREATE INDEX IF NOT EXISTS "accessGrants_accessCampaignId_idx" ON "accessGrants"("accessCampaignId");
CREATE INDEX IF NOT EXISTS "accessGrants_granterUserId_idx" ON "accessGrants"("granterUserId");
CREATE INDEX IF NOT EXISTS "accessGrants_revokedAt_idx" ON "accessGrants"("revokedAt");
CREATE INDEX IF NOT EXISTS "accessGrants_invalidatedAt_idx" ON "accessGrants"("invalidatedAt");
