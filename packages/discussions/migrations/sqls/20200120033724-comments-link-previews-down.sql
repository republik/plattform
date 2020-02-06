ALTER TABLE "comments"
  DROP COLUMN "urls",
  DROP COLUMN "embedUrl",
  DROP COLUMN "mentioningRepoId",
  DROP COLUMN "mentioningFragmentId"
;

ALTER TABLE "comments"
  RENAME COLUMN "reports" TO "reportedBy"
;

ALTER TABLE "discussions"
  DROP COLUMN "isBoard"
;

DROP INDEX IF EXISTS "comments_urls_idx";
DROP INDEX IF EXISTS "comments_embedUrl_idx";
DROP INDEX IF EXISTS "comments_mentioningRepoId_idx";
DROP INDEX IF EXISTS "comments_mentioningFragmentId_idx";
