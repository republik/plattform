ALTER TABLE "comments"
  DROP COLUMN "linkPreviewUrl",
  DROP COLUMN IF EXISTS "repoId",
  DROP COLUMN IF EXISTS "documentFragmentId"
;

ALTER TABLE "discussions"
  DROP COLUMN IF EXISTS "isBoard"
;
