-- Remove index on chargeAttempts.membershipId + createdAt

DROP INDEX CONCURRENTLY IF EXISTS "charge_attempts_membership_id_created_at_idx";
