ALTER TABLE "votings"
  DROP COLUMN IF EXISTS "allowEmptyBallots",
  DROP COLUMN IF EXISTS "allowedRoles"
;

ALTER TABLE "ballots"
  ALTER COLUMN "votingOptionId" SET NOT NULL
;

DROP TABLE "votingMembershipRequirement";
