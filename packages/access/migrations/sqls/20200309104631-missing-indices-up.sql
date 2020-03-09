CREATE INDEX IF NOT EXISTS "access_grants_access_campaign_id_idx" ON "accessGrants"("accessCampaignId");
CREATE INDEX IF NOT EXISTS "access_grants_granter_user_id_idx" ON "accessGrants"("granterUserId");
CREATE INDEX IF NOT EXISTS "access_grants_revoked_at_idx" ON "accessGrants"("revokedAt");
CREATE INDEX IF NOT EXISTS "access_grants_invalidated_at_idx" ON "accessGrants"("invalidatedAt");
