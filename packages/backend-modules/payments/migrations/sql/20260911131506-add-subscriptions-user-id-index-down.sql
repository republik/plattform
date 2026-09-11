-- Remove index on payments.subscriptions.userId

DROP INDEX CONCURRENTLY IF EXISTS "payments"."subscriptions_user_id_idx";
