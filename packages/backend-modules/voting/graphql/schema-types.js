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
  requireAddress: Boolean!
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
  requireAddress: Boolean!

  groupSlug: String

  name: String!
  discussion: Discussion

  turnout: VotingTurnout!
  groupTurnout: VotingTurnout

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
  groupTurnout: VotingTurnout
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
  # only group votings with identical restrictions (allow*)
  groupSlug: String
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
  requireAddress: Boolean!

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
  postalCodeGeo: PostalCodeGeo
  credential: Credential
  isIncumbent: Boolean
}

type PostalCodeGeo {
  countryName: String
  countryCode: String
  postalCode: String
  lat: Float
  lon: Float
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
  groupSlug: String
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

  # current user (me) is eligible to submit an answer
  userIsEligible: Boolean
  # current user (me) has submitted an answer
  userHasSubmitted: Boolean
  userSubmitDate: DateTime
  userSubmissionId: ID

  allowedMemberships: [VotingMembershipRequirement!]
  allowedRoles: [String!]

  # submits answers immediately and requires no
  # submitQuestionnaire mutation call
  submitAnswersImmediately: Boolean!

  # allows to resubmit already submitted answers ("edit")
  resubmitAnswers: Boolean!

  # allows to revoke a questionnaire submission
  revokeSubmissions: Boolean!

  # allows anonymous submissions
  # (see submitAnswerUnattributed mutation)
  unattributedAnswers: Boolean!

  questions(
    "select questions by order field"
    orderFilter: [Int!]
    "shuffle and limit the result to the specified count"
    shuffle: Int
  ): [QuestionInterface!]!

  turnout: QuestionnaireTurnout

  submissions(
    "Find search term in answer values"
    search: String
    "Find specific value in answers"
    value: String
    first: Int
    "Filter submissions"
    filters: SubmissionsFilterInput
    sort: SubmissionsSortInput
    before: String
    after: String
  ): SubmissionConnection
}

input SubmissionsFilterInput {
  "Return only submission with this ID"
  id: ID

  "Omit submission with this ID"
  not: ID

  "Return only submissions with these IDs"
  submissionIds: [ID!]

  "Omit submissions with these IDs"
  notSubmissionIds: [ID!]

  "Return only submissions with these answered question IDs"
  answeredQuestionIds: [ID!] @deprecated(reason: "use \`answers\` instead")

  "Return only submissions with one or more answers" 
  hasAnswers: Boolean @deprecated(reason: "use \`answers\` instead")

  "Return only submissions with these answered questions"
  answers: [SubmissionFilterAnswer]
  
  "Return submission by these user IDs"
  userIds: [ID!]
}

input SubmissionFilterAnswer {
  "Question wich must be answered"
  questionId: ID!

  "Expected amount of characters in answer given"
  valueLength: SubmissionFilterAnswerValueLength
}

input SubmissionFilterAnswerValueLength {
  "Expect a minimum amount of characters in answer given"
  min: Int
  "Expect a maximum amount of characters in answer given"
  max: Int
}

input SubmissionsSortInput {
  by: SubmissionsSortBy!
  direction: OrderDirection
}

enum SubmissionsSortBy {
  createdAt
  random
}

type SubmissionConnection {
  nodes: [Submission!]!
  pageInfo: SubmissionPageInfo!
  totalCount: Int!
}

type Submission {
  id: ID!
  questionnaire: Questionnaire!
  displayAuthor: DisplayUser!
  createdAt: DateTime!
  updatedAt: DateTime!

  answers: AnswerConnection!
}

type SubmissionPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

type AnswerConnection {
  nodes: [Answer!]!
  pageInfo: AnserPageInfo!
  totalCount: Int!
}

type AnserPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

type QuestionnaireTurnout {
  eligible: Int!
  submitted: Int!
}

interface QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
  userAnswer: Answer
  turnout: QuestionTurnout!
}

type QuestionTurnout {
  submitted: Int!
  skipped: Int!
  unattributed: Int!
}

type QuestionTypeText implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
  userAnswer: Answer
  turnout: QuestionTurnout!

  maxLength: Int
}

type QuestionTypeDocument implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
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
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
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
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
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
  requireAddress: Boolean
}
type QuestionTypeChoiceResult {
  option: QuestionTypeChoiceOption!
  count: Int!
}

type QuestionTypeImageChoice implements QuestionInterface {
  id: ID!
  questionnaire: Questionnaire!
  order: Int!
  private: Boolean!
  text: String!
  explanation: String
  metadata: JSON
  userAnswer: Answer
  turnout: QuestionTurnout!

  # 1: single-select
  # >1: multi-select (max: n)
  # 0: multi-select (infinite)
  cardinality: Int!
  options: [QuestionTypeImageChoiceOption!]!

  result(top: Int, min: Int): [QuestionTypeImageChoiceResult!]
}
type QuestionTypeImageChoiceOption {
  label: String!
  value: ID!
  category: String
  requireAddress: Boolean
  imageUrl: String
}
type QuestionTypeImageChoiceResult {
  option: QuestionTypeImageChoiceOption!
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
  submitted: Boolean!
  # indicates whether current payload is a draft
  drafted: Boolean

  question: QuestionInterface!

  # indicates whether this answer matched a search query
  hasMatched: Boolean
}

input VideoInput {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}

`
