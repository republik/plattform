DROP INDEX IF EXISTS "public"."mailLog_email_idx";
DROP INDEX IF EXISTS "public"."mailLog_createdAt_idx";
DROP INDEX IF EXISTS "public"."mailLog_userId_createdAt_idx";
DROP INDEX IF EXISTS "public"."mailLog_email_createdAt_idx";
DROP INDEX IF EXISTS "public"."mailLog_result__id_idx";
ALTER TABLE "public"."mailLog" DROP COLUMN "mandrillLastEvent";