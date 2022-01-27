CREATE INDEX IF NOT EXISTS "users_isListed_idx" ON "users"("isListed");
CREATE INDEX IF NOT EXISTS "users_isAdminUnlisted_idx" ON "users"("isAdminUnlisted");
CREATE INDEX IF NOT EXISTS "users_portraitUrl_idx" ON "users"("portraitUrl");

CREATE INDEX IF NOT EXISTS "users_roles_idx" ON "users" USING GIN ("roles");
