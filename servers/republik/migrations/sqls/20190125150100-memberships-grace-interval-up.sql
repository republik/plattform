ALTER TABLE "memberships"
  ADD COLUMN "graceInterval" interval NOT NULL DEFAULT '14 days'::interval
;
