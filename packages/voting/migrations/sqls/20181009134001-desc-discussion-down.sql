ALTER TABLE "votings"
  DROP COLUMN IF EXISTS "slug",
  DROP COLUMN IF EXISTS "discussionId",
  DROP COLUMN IF EXISTS "description"
;

ALTER TABLE "votingOptions"
  DROP COLUMN IF EXISTS "label",
  DROP COLUMN IF EXISTS "description"
;
