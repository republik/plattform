ALTER TABLE "discussions"
  DROP COLUMN IF EXISTS "defaultOrder"
;

DROP TYPE IF EXISTS "discussionOrder";