module.exports = `
interface VotingInterface {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  allowEmptyBallots: Boolean!
  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]
}

type Voting implements VotingInterface {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  options: [VotingOption!]!
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  allowEmptyBallots: Boolean!
  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]

  name: String!
  discussion: Discussion

  turnout: VotingTurnout
  result: VotingResult
}

type VotingTurnout {
  eligible: Int!
  submitted: Int!
}

type VotingOption {
  id: ID!
  name: String!
  label: String!
  description: String
}

type VotingOptionResult {
  option: VotingOption!
  count: Int!
  winner: Boolean
}

type VotingResult {
  options: [VotingOptionResult!]!
  stats: VotingStats!
  message: String
  video: Video
  createdAt: DateTime
  updatedAt: DateTime
}

type VotingStats {
  ages: [VotingStatsCount!]!
  countries: [VotingStatsCount!]!
  chCantons: [VotingStatsCount!]!
}

type VotingStatsCount {
  key: String!
  count: Int!
  options: [VotingOptionResult!]!
}

type VotingMembershipRequirement {
  membershipTypeId: ID!
  createdBefore: DateTime!
}

input VotingMembershipRequirementInput {
  membershipTypeId: ID!
  createdBefore: DateTime!
}

input VotingInput {
  name: String!
  options: [VotingOptionInput!]!
  slug: String!
  description: String!
  beginDate: DateTime!
  endDate: DateTime!
  allowEmptyBallots: Boolean
  allowedMemberships: [VotingMembershipRequirementInput!]
  allowedRoles: [String!]
}

input VotingOptionInput {
  name: String!
  label: String
  description: String
}



type Election implements VotingInterface {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  allowEmptyBallots: Boolean!
  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]

  numSeats: Int!
  candidacyBeginDate: DateTime!
  candidacyEndDate: DateTime!

  candidacies: [Candidacy!]!
  discussion: Discussion!

  turnout: ElectionTurnout
}

type Candidacy {
  id: ID!
  recommendation: String

  user: User!
  election: Election!
  comment: Comment!

  yearOfBirth: Int!
  city: String!
}

type ElectionTurnout {
  eligible: Int!
  submitted: Int!
}

input ElectionInput {
  numSeats: Int!
  candidacyBeginDate: DateTime!
  candidacyEndDate: DateTime!
  slug: String!
  description: String!
  beginDate: DateTime!
  endDate: DateTime!
  allowEmptyBallots: Boolean
  allowedMemberships: [VotingMembershipRequirementInput!]
  allowedRoles: [String!]
}


extend type User {
  candidacies: [Candidacy!]!
}
`
