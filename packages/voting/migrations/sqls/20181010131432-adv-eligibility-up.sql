ALTER TABLE "votings"
  ADD COLUMN "allowEmptyBallots" boolean not null default false,
  ADD COLUMN "allowedRoles" jsonb
;

ALTER TABLE "ballots"
  ALTER COLUMN "votingOptionId" DROP NOT NULL
;

CREATE TABLE "votingMembershipRequirements" (
  "votingId" uuid NOT NULL REFERENCES "votings"(id) ON UPDATE cascade ON DELETE cascade,
  "membershipTypeId" uuid NOT NULL REFERENCES "membershipTypes"(id),
  "createdBefore" timestamp with time zone NOT NULL DEFAULT now()
);


--- election

ALTER TABLE "elections"
  ADD COLUMN "allowEmptyBallots" boolean not null default false,
  ADD COLUMN "allowedRoles" jsonb
;

CREATE TABLE "electionMembershipRequirements" (
  "electionId" uuid NOT NULL REFERENCES "elections"(id) ON UPDATE cascade ON DELETE cascade,
  "membershipTypeId" uuid NOT NULL REFERENCES "membershipTypes"(id),
  "createdBefore" timestamp with time zone NOT NULL DEFAULT now()
);
