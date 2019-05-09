ALTER TABLE "discussions"
  RENAME "path" TO "documentPath"
;
ALTER TABLE "discussions"
  DROP COLUMN "repoId"
;
