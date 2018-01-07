module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  discussions: [Discussion!]!
  discussion(id: ID!): Discussion
  statements(
    first: Int!
    after: String
    seed: Float
    search: String
    # user id, legacy testimonial id or username to inject as first result
    focus: String
  ): UserConnection!
  greeting: Greeting
  faqs: [Faq!]!
  events: [Event!]!
  updates: [Update!]!
}

type mutations {
  updateMe(
    username: String
    firstName: String
    lastName: String
    hasPublicProfile: Boolean
    isListed: Boolean

    address: AddressInput

    portrait: String

    birthday: Date
    ageAccessRole: AccessRole

    phoneNumber: String
    phoneNumberNote: String
    phoneNumberAccessRole: AccessRole

    pgpPublicKey: String
    emailAccessRole: AccessRole

    statement: String
    biography: String
    facebookId: String
    twitterHandle: String
    publicUrl: String
  ): User!

  publishCredential(
    description: String!
  ): Credential!

  verifyCredential(
    userId: ID!
    description: String!
  ): Credential

  createDiscussion(
    title: String
    # max length of a comments content
    maxLength: Int
    # min milliseconds between comments of one user
    minInterval: Int
    anonymity: Permission!
  ): ID!
  submitComment(
    # client side generated id
    id: ID
    discussionId: ID!
    parentId: ID
    content: String!
    discussionPreferences: DiscussionPreferencesInput
  ): Comment!
  editComment(
    id: ID!
    content: String!
  ): Comment!
  # can be called by the creator or an admin
  unpublishComment(id: ID!): Comment!
  upvoteComment(id: ID!): Comment!
  downvoteComment(id: ID!): Comment!
  reportComment(id: ID!): Boolean!

  setDiscussionPreferences(
    id: ID!
    discussionPreferences: DiscussionPreferencesInput!
  ): Discussion!

  updateNewsletterSubscription(
    name: NewsletterName!,
    subscribed: Boolean!
  ): NewsletterSubscription!

  # for me
  # max 3 unique dates in three weeks
  requestPreview: Boolean!

  submitQuestion(question: String!): MutationResult
}

type subscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comment(discussionId: ID!): CommentUpdate!
  greeting: Greeting!
}
`
