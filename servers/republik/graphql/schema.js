module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  statements(
    first: Int!
    after: String
    seed: Float
    search: String
    # user id, legacy testimonial id or username to inject as first result
    focus: String
    "Return statements of users which have a membership beyond this date"
    membershipAfter: DateTime
  ): StatementUserConnection!
  nextStatement(
    sequenceNumber: Int!,
    orderDirection: OrderDirection!
  ): StatementUser!

  greeting: Greeting
  faqs: [Faq!]!
  events: [Event!]!
  updates: [Update!]!
  employees(
    "shuffle and limit the result to the specified count"
    shuffle: Int
    "boost one famous female and one famous male employee"
    withBoosted: Boolean
    "return employees with an onboarding greeting"
    withGreeting: Boolean
  ): [Employee!]!
  mediaResponses: [MediaResponse!]!
  membershipStats: MembershipStats!
  memberStats: MemberStats!
  revenueStats: RevenueStats!
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

  publishCredential(
    description: String
  ): Credential

  verifyCredential(
    userId: ID!
    description: String!
  ): Credential

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
  greeting: Greeting!
  webNotification: WebNotification!
}
`
