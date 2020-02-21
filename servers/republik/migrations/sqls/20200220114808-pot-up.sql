ALTER TABLE "memberships"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false
;

ALTER TABLE "packageOptions"
  ADD COLUMN "accessGranted" boolean NOT NULL DEFAULT false
;
