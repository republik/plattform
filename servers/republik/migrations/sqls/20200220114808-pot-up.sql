ALTER TABLE "memberships"
  ADD COLUMN "givePot" boolean NOT NULL DEFAULT false
;

ALTER TABLE "packageOptions"
  ADD COLUMN "givePot" boolean NOT NULL DEFAULT false
;

ALTER TABLE "pledgeOptions"
  ADD COLUMN "givePot" boolean NOT NULL DEFAULT false
;
