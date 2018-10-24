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

input ElectionBallotInput {
  electionId: ID!
  candidacyIds: [ID!]!
}

extend type User {
  candidacies: [Candidacy!]!
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

  questions: [Question!]!

  turnout: QuestionnaireTurnout
}

type QuestionnaireTurnout {
  eligible: Int!
  submitted: Int!
}

type Question {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  text: String
  type: QuestionType!

  userAnswer: Answer
}

union QuestionType = QuestionTypeText | QuestionTypeChoice | QuestionTypeRange | QuestionTypeDocument
enum QuestionTypeEnum {
  Text
  Choice
  Range
  Document
}
interface QuestionTypeInterface {
  type: QuestionTypeEnum!
}

type QuestionTypeText implements QuestionTypeInterface {
  type: QuestionTypeEnum!
  maxLength: Int
}

type QuestionTypeDocument implements QuestionTypeInterface {
  type: QuestionTypeEnum!
  template: String
}

enum QuestionTypeRangeKind {
  discrete
  continous
}
type QuestionTypeRange implements QuestionTypeInterface {
  type: QuestionTypeEnum!
  kind: QuestionTypeRangeKind!
  ticks: [QuestionTypeRangeTick!]!
}
type QuestionTypeRangeTick {
  label: String!
  value: Int!
}

type QuestionTypeChoice implements QuestionTypeInterface {
  type: QuestionTypeEnum!

  # 1: single-select
  # >1: multi-select (max: n)
  # 0: multi-select (infinite)
  cardinality: Int!

  options: [QuestionTypeChoiceOption!]!
}
type QuestionTypeChoiceOption {
  label: String!
  value: ID!
  category: String
}


input AnswerInput {
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

  question: Question!
}

`
