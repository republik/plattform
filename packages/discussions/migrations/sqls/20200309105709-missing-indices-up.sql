CREATE INDEX IF NOT EXISTS "discussions_hidden_idx" ON "discussions"("hidden");
CREATE INDEX IF NOT EXISTS "discussions_closed_idx" ON "discussions"("closed");

CREATE INDEX IF NOT EXISTS "comments_published_idx" ON "comments"("published");
CREATE INDEX IF NOT EXISTS "comments_adminUnpublished_idx" ON "comments"("adminUnpublished");
CREATE INDEX IF NOT EXISTS "comments_createdAt_idx" ON "comments"("createdAt");
