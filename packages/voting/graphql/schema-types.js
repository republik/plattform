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

  turnout: VotingTurnout!

  liveResult: Boolean!
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
  # null for emptyBallots
  option: VotingOption
  count: Int!
  winner: Boolean
}

type VotingResult {
  options: [VotingOptionResult!]!
  turnout: VotingTurnout!
  message: String
  video: Video
  createdAt: DateTime!
  updatedAt: DateTime!
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

input VotingBallotInput {
  votingId: ID!
  optionId: ID
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

  turnout: ElectionTurnout!

  liveResult: Boolean!
  result: ElectionResult
}

type Candidacy {
  id: ID!
  recommendation: String

  user: User!
  election: Election!
  comment: Comment!

  yearOfBirth: Int
  city: String
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

input ElectionBallotInput {
  electionId: ID!
  candidacyIds: [ID!]!
}

extend type User {
  candidacies: [Candidacy!]!
}

type ElectionCandidacyResult {
  candidacy: Candidacy
  count: Int!
  elected: Boolean
}

type ElectionResult {
  candidacies: [ElectionCandidacyResult!]!
  turnout: ElectionTurnout!
  message: String
  video: Video
  createdAt: DateTime
  updatedAt: DateTime
}



type Questionnaire {
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

  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]

  questions(orderFilter: [Int!]): [QuestionInterface!]!

  turnout: QuestionnaireTurnout
}

type QuestionnaireTurnout {
  eligible: Int!
  submitted: Int!
}

interface QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  userAnswer: Answer
  turnout: QuestionTurnout!
}

type QuestionTurnout {
  submitted: Int!
  skipped: Int!
}

type QuestionTypeText implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  userAnswer: Answer
  turnout: QuestionTurnout!

  maxLength: Int
}

type QuestionTypeDocument implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  userAnswer: Answer
  turnout: QuestionTurnout!

  template: String

  result(top: Int, min: Int): [QuestionTypeDocumentResult!]
}
type QuestionTypeDocumentResult {
  # only null if the document doesn exist anymore
  document: Document
  count: Int!
}

enum QuestionTypeRangeKind {
  discrete
  continous
}
type QuestionTypeRange implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  userAnswer: Answer
  turnout: QuestionTurnout!

  kind: QuestionTypeRangeKind!
  ticks: [QuestionTypeRangeTick!]!

  result: QuestionTypeRangeResult
}
type QuestionTypeRangeTick {
  label: String!
  value: Int!
}
type QuestionTypeRangeResultBin {
  x0: Float!
  x1: Float!
  count: Int!
}
type QuestionTypeRangeResult {
  histogram(ticks: Int): [QuestionTypeRangeResultBin!]!
  mean: Float!
  median: Float!
  # undefined for less than two values
  deviation: Float
}

type QuestionTypeChoice implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  userAnswer: Answer
  turnout: QuestionTurnout!

  # 1: single-select
  # >1: multi-select (max: n)
  # 0: multi-select (infinite)
  cardinality: Int!
  options: [QuestionTypeChoiceOption!]!

  result(top: Int, min: Int): [QuestionTypeChoiceResult!]
}
type QuestionTypeChoiceOption {
  label: String!
  value: ID!
  category: String
}
type QuestionTypeChoiceResult {
  option: QuestionTypeChoiceOption!
  count: Int!
}

input AnswerInput {
  # client generated
  id: ID!
  questionId: ID!
  # might be a: string, number, array of choices
  # null // delete answer
  # { value: "string" } // text
  # { value: 1.364 } // range
  # { value: "/2018/10/22/ein-realitaetsschock" } // article
  # { value: [
  #   "uuid-v4-bla-bla",
  #   "uuid-v4-bl2-bl2",
  # } // choice
  payload: JSON
}

type Answer {
  id: ID!
  payload: JSON!
}


input VideoInput {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}

`
