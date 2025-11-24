-- Remove trigram index on users.email

DROP INDEX CONCURRENTLY IF EXISTS "users_email_trgm_idx";

