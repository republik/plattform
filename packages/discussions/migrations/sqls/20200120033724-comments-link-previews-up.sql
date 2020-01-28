ALTER TABLE "comments"
  ADD COLUMN "linkPreviewUrl" citext,
  ADD COLUMN "repoId" text,
  ADD COLUMN "documentFragmentId" text
;

