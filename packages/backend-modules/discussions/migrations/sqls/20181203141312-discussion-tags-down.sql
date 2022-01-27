ALTER TABLE "discussions"
  DROP COLUMN "tags",
  DROP COLUMN "tagRequired"
;

ALTER TABLE "comments"
  DROP COLUMN "tags"
;

DROP INDEX IF EXISTS "discussions_tags_gin_idx";
DROP INDEX IF EXISTS "comments_tags_gin_idx";
