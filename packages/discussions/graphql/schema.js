module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  discussions: [Discussion!]!
  discussion(id: ID!): Discussion
  activeDiscussions(lastDays: Int!): [CommentAggregation!]!
  comments(
    orderBy: DiscussionOrder
    orderDirection: OrderDirection
    first: Int
    after: String
    discussionId: ID
    focusId: ID
    lastId: ID
  ): CommentConnection!
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
  reportComment(id: ID!): Boolean!

  setDiscussionPreferences(
    id: ID!
    discussionPreferences: DiscussionPreferencesInput!
  ): Discussion!

  updateDiscussion(id: ID!, closed: Boolean): Discussion!
}

type subscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comment(discussionId: ID!): CommentUpdate!
}
`
