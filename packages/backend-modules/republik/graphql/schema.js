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
  membershipStats: MembershipStats!
  memberStats: MemberStats!
  revenueStats: RevenueStats!
  roleStats(role: String!): RoleStats!
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

    birthyear: Int
    ageAccessRole: AccessRole

    phoneNumber: String
    phoneNumberNote: String
    phoneNumberAccessRole: AccessRole

    pgpPublicKey: String
    emailAccessRole: AccessRole

    statement: String
    biography: String
    profileUrls: JSON
    disclosures: String
    gender: String
    prolitterisId: String
  ): User!

  # required role: supporter
  updateUser(
    firstName: String
    lastName: String
    
    address: AddressInput

    birthyear: Int
    gender: String
    phoneNumber: String
    
    userId: ID!
  ): User!

  updateAddress(
    id: ID!,
    address: AddressInput!
  ): Address!

  publishCredential(
    description: String
  ): Credential

  verifyCredential(
    id: ID!
  ): Credential

  removeCredentialVerification(
    id: ID!
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

  resubscribeEmail(
    userId: ID,
  ): NewsletterSettings!

  requestNewsletterSubscription(
    email: String!
    name: NewsletterName!
    context: String!
  ): Boolean!

  reportUser(
    userId: ID!,
    """Reason for reporting the user. Max 500 characters."""
    reason: String!
  ): Boolean!

  setOnboarded(
    userId: ID!,
    """Onboarding date"""
    onboardingDate: DateTime!
  ): User!
}

type subscriptions {
  greeting: Greeting!
}
`
