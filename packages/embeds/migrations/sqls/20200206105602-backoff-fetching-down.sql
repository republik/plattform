ALTER TABLE "embeds"
  DROP COLUMN "numTries",
  DROP COLUMN "nextTryMinDate",
  DROP COLUMN "disappeared",
  DROP COLUMN "firstContent"
;

ALTER TABLE "embeds" ALTER COLUMN "content" SET NOT NULL;
