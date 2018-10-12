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



type Election {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!
  numSeats: Int!
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  allowEmptyBallots: Boolean!
  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]

  turnout: ElectionTurnout

  candidacies: [Candidacy!]!
  discussion: Discussion!
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
