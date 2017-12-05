module.exports = `
schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  repos(
    orderBy: RepoOrderBy
    milestonesFilters: [RepoMilestoneFilter!]
    #phaseFilter: RepoPhase
    formatFilter: String
  ): [Repo]!
  repo(id: ID!): Repo!
  embed(id: ID!, embedType: EmbedType!): Embed!
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
  ): Publication!

  unpublish(
    repoId: ID!
  ): Boolean!

  # Inform about my uncommited changes in the repo
  uncommittedChanges(
    repoId: ID!
    action: Action!
  ): Boolean!

  editRepoMeta(
    repoId: ID!
    creationDeadline: DateTime
    productionDeadline: DateTime
  ): Boolean!
}

type subscriptions {
  # Provides updates to the list of users
  # with uncommited changes in the repo
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
