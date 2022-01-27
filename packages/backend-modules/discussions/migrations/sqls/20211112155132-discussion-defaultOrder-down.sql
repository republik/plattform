ALTER TABLE "discussions"
  DROP COLUMN IF EXISTS "defaultOrder"
;

DROP DOMAIN discussion_order;
