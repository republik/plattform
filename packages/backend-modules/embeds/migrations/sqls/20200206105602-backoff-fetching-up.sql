ALTER TABLE "embeds"
  ADD COLUMN "numTries" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "nextTryMinDate" timestamptz,
  ADD COLUMN "disappeared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "firstContent" jsonb
;

ALTER TABLE "embeds" ALTER COLUMN "content" DROP NOT NULL;

UPDATE "embeds" SET "firstContent" = "content";
