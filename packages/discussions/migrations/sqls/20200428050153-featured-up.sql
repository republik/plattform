ALTER TABLE "comments"
  ADD COLUMN "featuredAt" timestamptz,
  ADD COLUMN "featuredContent" text
;

CREATE INDEX IF NOT EXISTS "comments_featured_at_idx" ON "comments"("featuredAt");
