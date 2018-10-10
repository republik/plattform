ALTER TABLE "votings"
  DROP COLUMN IF EXISTS "allowEmptyBallots",
  DROP COLUMN IF EXISTS "allowedRoles"
;

DROP TABLE "votingMembershipRequirement";
