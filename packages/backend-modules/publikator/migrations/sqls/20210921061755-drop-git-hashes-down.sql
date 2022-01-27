ALTER TABLE "publikator"."commits"
  ADD COLUMN "hash" text,
  ADD COLUMN "parentHashes" jsonb;
