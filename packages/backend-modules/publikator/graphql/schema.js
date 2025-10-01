module.exports = `
schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  repo(id: ID!): Repo

  """
  This query is a cached version of repos query. It uses cached information
  about repositories.
  """
  reposSearch(
    first: Int
    last: Int
    before: String
    after: String
    # can not be combined with orderBy
    publishDateRange: RepoPublishDateRange
    search: String
    template: String
    phases: [RepoPhaseKey!]
    orderBy: RepoOrderBy
    isTemplate: Boolean
    isSeriesMaster: Boolean
    isSeriesEpisode: Boolean
  ): RepoConnection!
}

type mutations {
  commit(
    repoId: ID!
    # specifies the parent commit. May only be
    # null if repoId doesn't exist yet
    parentId: ID
    message: String!
    document: DocumentInput!
    isTemplate: Boolean
    # files: [FileInput!]!     # FileInput
  ): Commit!

  placeMilestone(
    repoId: ID!
    commitId: ID!
    name: String!
    message: String!
  ): Milestone!

  removeMilestone(
    repoId: ID!
    name: String!
  ): Boolean!

  publish(
    repoId: ID!
    commitId: ID!
    settings: PublishSettings!
  ): PublishResponse!

  unpublish(
    repoId: ID!
  ): Boolean!

  generateDerivative(
    commitId: ID!
  ): Derivative!

  # Inform about my uncommitted changes in the repo
  uncommittedChanges(
    repoId: ID!
    action: Action!
  ): Boolean!

  editRepoMeta(
    repoId: ID!
    creationDeadline: DateTime
    productionDeadline: DateTime
    publishDate: DateTime
    briefingUrl: String
  ): Repo!

  archive(
    repoIds: [ID!]!
    unpublish: Boolean
  ): RepoConnection!

  publishMemo(
    id: ID
    repoId: ID!
    parentId: ID
    commitId: ID
    text: String!
  ): Memo!
  editMemo(
    id: ID
    text: String!
  ): Memo!
  unpublishMemo(
    id: ID
  ): Memo!

  "Begin an upload, returns an upload URL to PUT file to"
  repoFileUploadBegin(
    repoId: ID!
    name: String!
  ): RepoFile!
  "Commit an upload to file"
  repoFileUploadCommit(id: ID!): RepoFile!
  "Abort an upload, flags file as failed"
  repoFileUploadAbort(
    id: ID!
    error: String!
  ): RepoFile!
  "Make repo file public"
  repoFileMakePublic(id: ID!): RepoFile!
  "Make repo file private"
  repoFileMakePrivate(id: ID!): RepoFile!
  "Destroy repo file"
  repoFileDestroy(id: ID!): RepoFile!
}

type subscriptions {
  # Provides updates to the list of users
  # with uncommitted changes in the repo
  uncommittedChanges(
    repoId: ID!
  ): UncommittedChangeUpdate!
  # triggered on repo update
  # (commit, place-/removeMilestone, un-publish)
  repoUpdate(
    repoId: ID
  ): Repo! @deprecated(reason: "use \`repoChange\` subscrption instead")
  repoChange(
    repoId: ID!
  ): RepoChange!
}
`
