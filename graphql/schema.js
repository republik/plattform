module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
}

type queries {
  discussions: [Discussion!]!
  discussion(id: ID!): Discussion
  testimonials(
    offset: Int,
    limit: Int,
    seed: Float,
    search: String,
    firstId: ID,
    videosOnly: Boolean
  ): [Testimonial!]!
  greeting: Greeting
}

type mutations {
  updateMe(
    username: String
    firstName: String
    lastName: String
    hasPublicProfile: Boolean

    address: AddressInput

    birthday: Date
    ageAccessRole: AccessRole

    phoneNumber: String
    phoneNumberNote: String
    phoneNumberAccessRole: AccessRole

    pgpPublicKey: String
    emailAccessRole: AccessRole

    biography: String
    facebookId: String
    twitterHandle: String
    publicUrl: String
  ): User!

  submitTestimonial(
    role: String,
    quote: String!,
    image: String
  ): Testimonial!
  unpublishTestimonial: Boolean

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
}

type subscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comments(discussionId: ID!): Comment!
  greeting: Greeting!
}
`
