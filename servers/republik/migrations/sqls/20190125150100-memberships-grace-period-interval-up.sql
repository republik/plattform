ALTER TABLE "memberships"
  ADD COLUMN "gracePeriodInterval" interval NOT NULL DEFAULT '14 days'::interval
;
