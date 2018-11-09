ALTER TABLE "discussions"
  RENAME "documentPath" TO "path"
;
ALTER TABLE "discussions"
  ADD COLUMN "repoId" text
;
