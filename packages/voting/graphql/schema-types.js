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
}

#enum QuestionType {
#  text
#  multipleChoice
#  singleChoice
#  discreteRange
#  continouesRange
#  article
#  number
#}

type Question {
  id: ID!
  order: Int!
  text: String

  questionnaire: Questionnaire!

  #type: QuestionType!

  # no options for text and article
  #options: [QuestionOption!]!
  # text: null
  # article: null
  # number: null
  # range: [ { label: "nie", value: -1 }, { label: "regelmässig", value: 0 }, { label: "immer", value: 1 } ]
  # m-/s-choice: [ { label: "schlecht", id: "uuid-yadi-yadi" }, { label: "gut", id: "another-uuid-ddd" } ]
  #options: JSON

  type: QuestionType!

  userAnswer: Answer
}

union QuestionType = QuestionTypeText | QuestionTypeChoice | QuestionTypeRange | QuestionTypeArticle
enum QuestionTypeEnum {
  Text
  Choice
  Range
  Article
  Format
}
interface QuestionTypeInterface {
  type: QuestionTypeEnum!
}

type QuestionTypeText implements QuestionTypeInterface {
  type: QuestionTypeEnum!
  maxLength: Int
}
type QuestionTypeArticle {
  type: QuestionTypeEnum!
}

enum QuestionTypeRangeKind {
  discrete
  continous
}
type QuestionTypeRange {
  type: QuestionTypeEnum!
  kind: QuestionTypeRangeKind!
  ticks: [QuestionTypeRangeTick!]!
}
type QuestionTypeRangeTick {
  label: String!
  value: Int!
}

type QuestionTypeChoice {
  type: QuestionTypeEnum!

  # 1: single select
  # >1: multi select
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
  # { value: "string" } // text
  # { value: 1.364 } // range
  # { value: "/2018/10/22/ein-realitaetsschock" } // article
  # { value: [
  #   { id: "uuid-v4-bla-bla" },
  #   { id: "uuid-v4-bl2-bl2" },
  # ] }
  payload: JSON!
}

type Answer {
  id: ID!
  payload: JSON!
}

`
