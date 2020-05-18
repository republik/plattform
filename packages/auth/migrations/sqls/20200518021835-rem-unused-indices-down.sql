CREATE INDEX IF NOT EXISTS "sessions_expire_idx" ON "sessions"("expire");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions" (((sess #>> '{passport, user}')::uuid));
