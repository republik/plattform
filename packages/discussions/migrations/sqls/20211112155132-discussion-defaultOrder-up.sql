CREATE TYPE "discussionOrder" AS ENUM (
  'AUTO',
  'DATE',
  'VOTES',
  'HOT',
  'REPLIES',
  'FEATURED_AT'
);

ALTER TABLE "discussions" 
  ADD COLUMN "defaultOrder" "discussionOrder";
