-- migrate up here: CREATE TABLE...

-- this was done directly on the DB instead

-- ALTER TABLE "public"."notifications"
  -- DROP CONSTRAINT IF EXISTS "notifications_subscriptionId_fkey",
  -- ADD CONSTRAINT IF NOT EXISTS "notifications_subscriptionId_cascade_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;

-- ALTER TABLE "public"."subscriptions"
  -- DROP CONSTRAINT IF EXISTS "subscriptions_objectUserId_fkey",
  -- ADD CONSTRAINT IF NOT EXISTS "subscriptions_objectUserId_cascade_fkey" FOREIGN KEY ("objectUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
