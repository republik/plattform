module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  discussions: [Discussion!]!
  discussion(id: ID, path: String): Discussion
  activeDiscussions(
    lastDays: Int!
    first: Int
  ): [CommentAggregation!]!
  comments(
    orderBy: DiscussionOrder
    orderDirection: OrderDirection
    first: Int
    after: String
    discussionId: ID
    discussionIds: [ID!]
    toDepth: Int
    focusId: ID
    lastId: ID
    featured: Boolean
    featuredTarget: CommentFeaturedTarget
  ): CommentConnection!
  comment(id: ID!): Comment!

  commentPreview(
    id: ID
    discussionId: ID!
    parentId: ID
    content: String!
    tags: [String!]
  ): Comment!

  discussionsStats: DiscussionsStats!
}

type mutations {
  updateNotificationSettings(
    defaultDiscussionNotificationOption: DiscussionNotificationOption
    discussionNotificationChannels: [DiscussionNotificationChannel!]
  ): User!

  createDiscussion(
    title: String
    # max length of a comments content
    maxLength: Int
    # min milliseconds between comments of one user
    minInterval: Int
    anonymity: Permission!
    tags: [String!]
    # is a tag required (only applies to root level)
    tagRequired: Boolean!
  ): ID!
  submitComment(
    # client side generated id
    id: ID
    # can be discussion id or repoId
    discussionId: ID!
    parentId: ID
    content: String!
    discussionPreferences: DiscussionPreferencesInput
    tags: [String!]
  ): Comment!
  editComment(
    id: ID!
    content: String!
    tags: [String!]
  ): Comment!
  # can be called by the creator or an admin
  unpublishComment(id: ID!): Comment!
  upvoteComment(id: ID!): Comment!
  downvoteComment(id: ID!): Comment!
  unvoteComment(id: ID!): Comment!
  reportComment(id: ID!, description: String): Comment!

  setDiscussionPreferences(
    id: ID!
    discussionPreferences: DiscussionPreferencesInput!
  ): Discussion!

  updateDiscussion(id: ID!, closed: Boolean): Discussion!

  # requires role: editor
  # content = null: unfeature comment
  featureComment(
    id: ID!
    content: String
    targets: [CommentFeaturedTarget!]
  ): Comment!

  suspendUser(
    id: ID!
    until: DateTime @deprecated(reason: "Use interval and intervalAmount instead")
    interval: String
    intervalAmount: Int
    reason: String
  ): User!
  unsuspendUser(id: ID!): User!
}

type subscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comment(discussionId: ID!): CommentUpdate!
}
`
