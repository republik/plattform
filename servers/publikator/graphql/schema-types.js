module.exports = `
scalar DateTime
scalar JSON

type Repo {
  id: ID!
  commits(first: Int, before: String, after: String): CommitConnection!
  latestCommit: Commit!
  commit(id: ID!): Commit!
  uncommittedChanges: [User!]!
  milestones: [Milestone!]!
  # nothing or latest prepublication and/or latest publication
  # nothing if repo is unpublished
  latestPublications: [Publication]!

  mailchimpUrl: String
  unpublished: Boolean!

  meta: RepoMeta!

  isArchived: Boolean!
}

type RepoConnection {
  nodes: [Repo]
  pageInfo: PageInfo!
  totalCount: Int!
  totalDiskUsage: Int
}

type PageInfo {
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

input RepoOrderBy {
  field: RepoOrderField!
  direction: OrderDirection!
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
  document: Document!
  repo: Repo!

# files: [File]!
}

type CommitConnection {
  nodes: [Commit!]!
  pageInfo: PageInfo!
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
`
