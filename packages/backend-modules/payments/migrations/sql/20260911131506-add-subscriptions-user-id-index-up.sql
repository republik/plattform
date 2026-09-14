-- Add index on payments.subscriptions.userId
--
-- This is a NOT NULL foreign-key column (fk_subscription_user) with no
-- supporting index, forcing a full sequential scan of the table on every
-- lookup by user. pg_stat_user_tables showed 24.6M sequential scans against
-- this table (by far the largest of any table in the DB), driven by
-- per-user subscription-status checks in the request path and by the
-- cockpit_membership_evolution materialized view's self-join on userId.
--
-- Already applied directly to production; added here so it's tracked in
-- code and applied automatically in other environments.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "subscriptions_user_id_idx"
  ON "payments"."subscriptions" ("userId");
