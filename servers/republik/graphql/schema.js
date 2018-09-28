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
  nextStatement(
    sequenceNumber: Int!,
    orderDirection: OrderDirection!
  ): User!

  greeting: Greeting
  faqs: [Faq!]!
  events: [Event!]!
  updates: [Update!]!
  employees: [Employee!]!
  membershipStats: MembershipStats!
  memberStats: MemberStats!
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
    disclosures: String
  ): User!

  updateNotificationSettings(
    defaultDiscussionNotificationOption: DiscussionNotificationOption
    discussionNotificationChannels: [DiscussionNotificationChannel!]
  ): User!

  publishCredential(
    description: String
  ): Credential

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

  updateDiscussion(id: ID!, closed: Boolean): Discussion!

  # if userId is null, the logged in user's subscription is changed
  # required role to change other users: supporter
  # if email and hmac is set, the user is upserted (used for newsletter signup)
  updateNewsletterSubscription(
    userId: ID,
    name: NewsletterName!
    subscribed: Boolean!
    email: String,
    mac: String,
    consents: [String!]
  ): NewsletterSubscription!

  submitQuestion(question: String!): MutationResult

  # max every 12h
  requestPreview: MutationResult!
}

type subscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comment(discussionId: ID!): CommentUpdate!
  greeting: Greeting!
  webNotification: WebNotification!
}
`
