ALTER TABLE "comments"
  ADD COLUMN "linkPreviewUrl" citext,
  ADD COLUMN "repoId" text,
  ADD COLUMN "documentFragmentId" text
;
ALTER TABLE "comments"
  RENAME COLUMN "reportedBy" TO "reports"
;

ALTER TABLE "discussions"
  ADD COLUMN "isBoard" boolean NOT NULL default false
;
