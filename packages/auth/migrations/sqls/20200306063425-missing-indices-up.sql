CREATE INDEX IF NOT EXISTS "tokens_expires_at_idx" ON "tokens"("expiresAt");
CREATE INDEX IF NOT EXISTS "tokens_created_at_idx" ON "tokens"("createdAt");
