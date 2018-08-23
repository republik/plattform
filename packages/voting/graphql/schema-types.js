module.exports = `
type Voting {
  id: ID!
  name: String!
  beginDate: DateTime!
  endDate: DateTime!
  options: [VoteOption!]!
  turnout: VoteTurnout!
  result: VoteResult
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
}
type VoteTurnout {
  eligible: Int!
  submitted: Int!
}
type VoteOption {
  id: ID!
  name: String!
  label: String!
  description: String
}
type VoteOptionResult {
  id: ID!
  option: VoteOption!
  count: Int!
  winner: Boolean
}
type VoteResult {
  options: [VoteOptionResult!]!
  stats: VoteStats!
  message: String
  video: Video
  createdAt: DateTime
  updatedAt: DateTime
}
type VoteStats {
  ages: [VoteStatsCount!]!
  countries: [VoteStatsCount!]!
  chCantons: [VoteStatsCount!]!
}
type VoteStatsCount {
  key: String!
  count: Int!
  options: [VoteOptionResult!]!
}
`
