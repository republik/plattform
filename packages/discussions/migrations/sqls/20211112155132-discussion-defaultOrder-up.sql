CREATE DOMAIN discussion_order AS TEXT
CHECK(
  VALUE IN (
    'AUTO',
    'DATE',
    'VOTES',
    'HOT',
    'REPLIES',
    'FEATURED_AT'
  )
);

ALTER TABLE "discussions"
  ADD COLUMN "defaultOrder" discussion_order
;
