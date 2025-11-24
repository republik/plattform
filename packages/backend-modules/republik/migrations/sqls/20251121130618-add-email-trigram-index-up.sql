-- Add trigram index on users.email to speed up fuzzy email searches
-- This index enables fast similarity searches using the % operator
-- and significantly improves adminUsers query performance

CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_email_trgm_idx" 
  ON "public"."users" 
  USING GIN (email gin_trgm_ops);

