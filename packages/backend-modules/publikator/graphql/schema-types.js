const { getPhases } = require('../lib/phases')

module.exports = `
scalar DateTime
scalar JSON

type Repo {
  id: ID!
  commits(first: Int, before: String, after: String): CommitConnection!
  latestCommit: Commit!
  commit(id: ID!): Commit
  uncommittedChanges: [User!]!
  files: [RepoFile!]!
  memos: [Memo!]!
  milestones: [Milestone!]!
  # nothing or latest prepublication and/or latest publication
  # nothing if repo is unpublished
  latestPublications: [Publication]!

  meta: RepoMeta!
  currentPhase: RepoPhase!

  isArchived: Boolean!
  isTemplate: Boolean!
}

interface RepoPhaseInterface {
  key: RepoPhaseKey!
  color: String!
  lock: Boolean!
  label: String!
}

type RepoPhase implements RepoPhaseInterface {
  key: RepoPhaseKey!
  color: String!
  lock: Boolean!
  label: String!
}

type RepoPhaseWithCount implements RepoPhaseInterface {
  key: RepoPhaseKey!
  color: String!
  lock: Boolean!
  label: String!
  count: Int!
}

type RepoConnection {
  nodes: [Repo]
  phases: [RepoPhaseWithCount]
  pageInfo: PublikatorPageInfo!
  totalCount: Int!
  totalDiskUsage: Int @deprecated(reason: "Do not use anymore. Part of GitHub heydays.")
}

type PublikatorPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

type RepoMeta {
  creationDeadline: DateTime
  productionDeadline: DateTime
  publishDate: DateTime
  briefingUrl: String
}

input RepoPublishDateRange {
  from: DateTime!
  until: DateTime!
}

input RepoOrderBy {
  field: RepoOrderField!
  direction: OrderDirection!
}

enum RepoPhaseKey {
${getPhases()
  .map((p) => p.key)
  .join('\n')}
}

enum RepoOrderField {
  #Order repositories by creation time
  CREATED_AT
  #Order repositories by update time
  UPDATED_AT
  #Order repositories by push time
  PUSHED_AT
  #Order repositories by name
  NAME
  #Order repositories by number of stargazers
  STARGAZERS
}

interface MilestoneInterface {
  name: String!
  commit: Commit!
  author: Author!
  date: DateTime!
}

input PublishSettings {
  prepublication: Boolean!
  # on all channels
  scheduledAt: DateTime
  # this API never triggers sending
  # not immediately, not scheduled
  updateMailchimp: Boolean!
  ignoreUnresolvedRepoIds: Boolean
  # skip generating new synth voice audio derivative and use latest instead
  skipSynthAudioGeneration: Boolean
}

type PublishResponse {
  # repoIds of related documents that could not be resolved
  unresolvedRepoIds: [ID!]!
  # the finished publication. Empty if unresolvedRepoIds not allowed.
  publication: Publication
}

type Publication implements MilestoneInterface {
  name: String!
  commit: Commit!
  # this document comes straight out of the publication cache and includes all transforms done on publish.
  document: Document
  author: Author!
  date: DateTime!

  live: Boolean!
  prepublication: Boolean!
  scheduledAt: DateTime
  updateMailchimp: Boolean!
  sha: String!
}

type Milestone implements MilestoneInterface {
  name: String!
  commit: Commit!
  author: Author!
  date: DateTime!

  message: String
  immutable: Boolean!
}

type Commit {
  id: ID!
  parentIds: [ID!]!
  message: String
  author: Author!
  date: DateTime!
  markdown: String!
  document: Document!
  derivatives: [Derivative!]
  associatedDerivative: Derivative
  canDerive(type: DerivativeType!): Boolean!
  repo: Repo!
}

type CommitConnection {
  nodes: [Commit!]!
  pageInfo: PublikatorPageInfo!
  totalCount: Int!
}

type Author {
  name: String!
  email: String!
  user: User
}

type UncommittedChangeUpdate {
  repoId: ID!
  user: User!
  action: Action!
}

enum Action {
  create
  delete
}

type RepoChange {
  mutation: RepoChangeMutationType!
  repo: Repo
  commit: Commit
  milestone: Milestone
}

enum RepoChangeMutationType {
  CREATED
  UPDATED
  DELETED
}

type Memo {
  id: ID!
  parentIds: [ID!]!
  text: String
  content: JSON
  author: Author!
  published: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Derivative {
  id: ID!
  type: DerivativeType!
  status: DerivativeStatus!
  result: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
  readyAt: DateTime
  failedAt: DateTime
  destroyedAt: DateTime
  # commit the derivative was generated from
  commit: Commit!
}

enum DerivativeType {
  SyntheticReadAloud
}

enum DerivativeStatus {
  Pending
  Ready
  Failure
  Destroyed
}

enum RepoFileStatus {
  Pending
  Failure
  Private
  Public
  Destroyed
}

type RepoFile {
  id: ID!
  name: String!
  status: RepoFileStatus!
  "If file is not ready, returns an upload URL"
  url: String
  error: String
  author: Author!
  createdAt: DateTime!
  updatedAt: DateTime!
  readyAt: DateTime
  failedAt: DateTime
  destroyedAt: DateTime
  # Image-specific metadata
  contentType: String
  size: Int
  width: Int
  height: Int
  isImage: Boolean!
}

`
