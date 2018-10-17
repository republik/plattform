CREATE INDEX IF NOT EXISTS "election_membership_requirements_election_id_idx" ON "electionMembershipRequirements"("electionId");
CREATE INDEX IF NOT EXISTS "election_membership_requirements_membership_type_id_idx" ON "electionMembershipRequirements"("membershipTypeId");

CREATE INDEX IF NOT EXISTS "voting_membership_requirements_election_id_idx" ON "votingMembershipRequirements"("votingId");
CREATE INDEX IF NOT EXISTS "voting_membership_requirements_membership_type_id_idx" ON "votingMembershipRequirements"("membershipTypeId");

CREATE INDEX IF NOT EXISTS "memberships_membership_type_id_idx" ON "memberships"("membershipTypeId");
CREATE INDEX IF NOT EXISTS "memberships_created_at_idx" ON "memberships"("createdAt");
