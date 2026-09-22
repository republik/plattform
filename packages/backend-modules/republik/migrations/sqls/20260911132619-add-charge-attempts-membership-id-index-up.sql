-- Add index on chargeAttempts.membershipId + createdAt
--
-- "membershipId" is a NOT NULL foreign key (references memberships) with no
-- supporting index (pg_stat_user_indexes showed idx_scan=0 for this table,
-- i.e. every access is a full sequential scan). It's queried once per
-- membership inside the memberships-owners scheduler job
-- (packages/backend-modules/republik-crowdfundings/lib/scheduler/owners/charging.js:28):
--
--   pgdb.public.chargeAttempts.find(
--     { membershipId, 'createdAt >=': anchorDate },
--     { orderBy: { createdAt: 'DESC' } },
--   )
--
-- Composite index matches both the equality filter and the range/order
-- column.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "charge_attempts_membership_id_created_at_idx"
  ON "chargeAttempts" ("membershipId", "createdAt" DESC);
