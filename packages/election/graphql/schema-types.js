module.exports = `

type Election {
  id: ID!
  slug: String!
  description: String
  beginDate: DateTime!
  endDate: DateTime!

  numSeats: Int!
  candidates: [Candidate!]!
  discussion: Discussion!

  shortSlug: String

  turnout: ElectionTurnout
  result: ElectionResult
  # current user (me) is eligible to submit a ballot
  userIsEligible: Boolean!
  # current user (me) has submitted a ballot
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
}

input ElectionInput {
  slug: String!
  description: String!
  beginDate: DateTime!
  endDate: DateTime!
  numSeats: Int!
  shortSlug: String
}

type ElectionTurnout {
  eligible: Int!
  submitted: Int!
}

type Candidate {
  id: ID!
  electionId: ID!
  user: User!
  yearOfBirth: Int!
  city: String!
  discussion: Comment!
  recommendation: String
}

type CandidateResult {
  candidate: Candidate!
  count: Int!
  elected: Boolean
}

type ElectionResult {
  candidates: [CandidateResult!]!
  stats: ElectionStats!
  message: String
  video: Video
  createdAt: DateTime
  updatedAt: DateTime
}

type ElectionStats {
  ages: [ElectionStatsCount!]!
  countries: [ElectionStatsCount!]!
  chCantons: [ElectionStatsCount!]!
}

type ElectionStatsCount {
  key: String!
  count: Int!
  candidates: [CandidateResult!]!
}

`
