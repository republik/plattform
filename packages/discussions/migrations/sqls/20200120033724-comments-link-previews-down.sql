ALTER TABLE "comments"
  DROP COLUMN "linkPreviewUrl",
  DROP COLUMN IF EXISTS "repoId",
  DROP COLUMN IF EXISTS "documentFragmentId"
;
