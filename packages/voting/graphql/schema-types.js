module.exports = `

type Voting {
  id: ID!
  name: String!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  options: [VotingOption!]!
  turnout: VotingTurnout
  result: VotingResult
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  discussion: Discussion
  allowEmptyBallots: Boolean!
  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]
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

input VotingInput {
  name: String!
  description: String!
  slug: String!
  beginDate: DateTime!
  endDate: DateTime!
  options: [VotingOptionInput!]!
  allowedMemberships: [VotingMembershipRequirementInput!]
  allowedRoles: [String!]
}

input VotingOptionInput {
  name: String!
  label: String
  description: String
}

input VotingMembershipRequirementInput {
  membershipTypeId: ID!
  createdBefore: DateTime!
}
`
