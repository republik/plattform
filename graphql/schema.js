const typeDefinitions = `
scalar Date
scalar DateTime
scalar JSON

schema {
  query: RootQuerys
  mutation: RootMutations
  subscription: RootSubscriptions
}

type RootQuerys {
  me: User
  publicUser(id: ID!): PublicUser
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
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!
  updateMe(
    firstName: String,
    lastName: String,
    birthday: Date,
    phoneNumber: String,
    address: AddressInput,
    facebookId: String,
    twitterHandle: String,
    publicUrl: String,
    isEmailPublic: Boolean,
    isPrivate: Boolean
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
  ): DiscussionPreferences!
}

type RootSubscriptions {
  # all in one subscription:
  # create, update, unpublish, vote
  comments(discussionId: ID!): Comment!
}

type Credential {
  description: String!
  verified: Boolean!
}

type PublicUser {
  # TODO: Review existing user objects.
  id: ID!
  name: String!
  email: String
  credentials: [Credential!]!
  testimonial: Testimonial
  facebookId: String
  twitterHandle: String
  publicUrl: String
  isEmailPublic: Boolean
  badges: [Badge]
  latestComments(limit: Int!): [Comment]
}

type User {
  id: ID!
  name: String!
  firstName: String!
  lastName: String!
  initials: String!
  email: String
  address: Address
  birthday: Date
  phoneNumber: String
  roles: [String]!
  publicUser: PublicUser
  isPrivate: Boolean
}

type Address {
  name: String
  line1: String!
  line2: String
  postalCode: String!
  city: String!
  country: String!
}

input AddressInput {
  name: String!
  line1: String!
  line2: String
  postalCode: String!
  city: String!
  country: String!
}

enum Badge {
  CROWDFUNDER
  PATRON
  STAFF
  FREELANCER
}

type Testimonial {
  # This is a plain copy of the crowdfunding testimonial schema.
  # TODO: Review for improvements, e.g. merging with profilePicture.
  id: ID!
  userId: ID!
  name: String!
  role: String
  quote: String
  video: Video
  # 384x384 JPEG HTTPS URL
  image(size: ImageSize): String!
  smImage: String
  published: Boolean
  adminUnpublished: Boolean
  sequenceNumber: Int
}

enum ImageSize {
  SHARE
}

type Video {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}

enum Permission {
  ALLOWED
  ENFORCED
  FORBIDDEN
}

type DiscussionRules {
  # max length of a comments content
  maxLength: Int
  # min milliseconds between comments of one user
  minInterval: Int
  anonymity: Permission!
}

type DiscussionPreferences {
  anonymity: Boolean!
  credential: Credential
}
input DiscussionPreferencesInput {
  anonymity: Boolean!
  credential: String
}

enum DiscussionOrder {
  DATE
  VOTES
  HOT
}

enum OrderDirection {
  ASC
  DESC
}

type PageInfo {
  # If endCursor is null and hasNextPage is true
  # this node would have child nodes.
  # Get them with this nodes id as parentId.
  #
  # If endCursor is not null and hasNextPage is true
  # there exist more child nodes than currently delivered.
  # Get them with endCursor as after.
  endCursor: String
  # If endCursor is null and hasNextPage is true
  # this node would have child nodes.
  # Get them with this nodes id as parentId.
  #
  # If endCursor is not null and hasNextPage is true
  # there exist more nodes than currently delivered.
  # Get them with endCursor as after.
  hasNextPage: Boolean
}
type CommentConnection {
  # recursive down the tree
  totalCount: Int!
  pageInfo: PageInfo
  nodes: [Comment]!
}

type Discussion {
  id: ID!
  # _id is a hash of id and the arguments of comments() selection
  # in UUID format.
  # _id is stable: for the same discussion and the same selection
  # args, the same _id is returned.
  _id: ID!
  title: String
  comments(
    # get children of this parent
    parentId: ID
    # Get next page after cursor.
    # If after is specified parentId, focusId,
    # orderBy and orderDirection are ignored
    after: String
    # Limit result to num of first elements in respect
    # to orderBy and orderDirection. Please note that the
    # number of returned elements might exceed first if the
    # first elements are deep inside the tree, all coresponding
    # parents are returned as well.
    first: Int
    # include this comment and context around it
    # don't use in combination with parentId or after
    focusId: ID
    orderBy: DiscussionOrder
    orderDirection: OrderDirection
  ): CommentConnection!
  rules: DiscussionRules!
  userPreference: DiscussionPreferences
  # date the user is allowed to submit new comments
  # if null the user can submit immediately
  userWaitUntil: DateTime
}

type DisplayUser {
  name: String!
  credential: Credential
  profilePicture: String
}

enum CommentVote {
  UP
  DOWN
}

type Comment {
  discussion: Discussion!
  id: ID!
  parent: Comment
  comments: CommentConnection!
  # maybe becomes mdast/JSON later
  content: String!
  upVotes: Int!
  downVotes: Int!
  # score based on votes
  score: Int!
  # admin/mod only
  author: User
  displayAuthor: DisplayUser!
  userVote: CommentVote
  userCanEdit: Boolean
  createdAt: DateTime!
  updatedAt: DateTime!

  depth: Int!
  _depth: Int!
  hottnes: Float!
}

type SignInResponse {
  phrase: String!
}
`
module.exports = [typeDefinitions]
