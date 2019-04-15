module.exports = `
schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  repos(
    first: Int
    last: Int
    before: String
    after: String
    # can not be combined with orderBy
    search: String
    orderBy: RepoOrderBy
  ): RepoConnection!
  repo(id: ID!): Repo!
  embed(id: ID!, embedType: EmbedType!): Embed!

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
    search: String
    template: String
    orderBy: RepoOrderBy
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
    prepublication: Boolean!

    # on all channels
    scheduledAt: DateTime
    # this API never triggers sending
    # not immediately, not scheduled
    updateMailchimp: Boolean!

    ignoreUnresolvedRepoIds: Boolean
  ): PublishResponse!

  unpublish(
    repoId: ID!
  ): Boolean!

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
  ): Repo!
}
`
