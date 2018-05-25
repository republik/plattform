CREATE INDEX IF NOT EXISTS "users_addressId_idx" ON "users"("addressId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_idx" ON "users"(lower(email));

CREATE INDEX IF NOT EXISTS "sessions_expire_idx" ON "sessions"("expire");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions" (((sess #>> '{passport, user}')::uuid));

CREATE INDEX IF NOT EXISTS "eventLog_userId_idx" ON "eventLog"("userId");

CREATE INDEX IF NOT EXISTS "tokens_email_lower_idx" ON "tokens"(lower(email));
CREATE INDEX IF NOT EXISTS "tokens_sessionId_idx" ON "tokens"("sessionId");
CREATE INDEX IF NOT EXISTS "tokens_type_idx" ON "tokens"("type");
