ALTER TABLE "memberships"
  ADD COLUMN "succeedingMembershipId" uuid references "memberships"(id)
;
