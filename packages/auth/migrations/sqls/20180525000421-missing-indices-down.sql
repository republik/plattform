DROP INDEX IF EXISTS "users_addressId_idx";
DROP INDEX IF EXISTS "users_email_lower_idx";

DROP INDEX IF EXISTS "sessions_expire_idx";
DROP INDEX IF EXISTS "sessions_userId_idx";

DROP INDEX IF EXISTS "eventLog_userId_idx";

DROP INDEX IF EXISTS "tokens_email_lower_idx";
DROP INDEX IF EXISTS "tokens_sessionId_idx";
DROP INDEX IF EXISTS "tokens_type_idx";
