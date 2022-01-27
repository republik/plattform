ALTER TABLE "comments"
  DROP COLUMN "featuredAt",
  DROP COLUMN "featuredContent"
;

DROP INDEX IF EXISTS "comments_featured_at_idx";
