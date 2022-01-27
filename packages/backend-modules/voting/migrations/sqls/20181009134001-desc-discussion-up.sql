ALTER TABLE "votings"
  ADD COLUMN "slug" text,
  ADD COLUMN "discussionId" uuid,
  ADD COLUMN "description" text
;

ALTER TABLE "votingOptions"
  ADD COLUMN "label" text,
  ADD COLUMN "description" text
;

