-- migrate up here: CREATE TABLE...
ALTER TABLE "public"."notifications"
  DROP CONSTRAINT "notifications_subscriptionId_fkey",
  ADD CONSTRAINT "notifications_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;

ALTER TABLE "public"."subscriptions"
  DROP CONSTRAINT "subscriptions_objectUserId_fkey",
  ADD CONSTRAINT "subscriptions_objectUserId_fkey" FOREIGN KEY ("objectUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
