module.exports = `

type Credential {
  description: String!
  verified: Boolean!
  isListed: Boolean!
}

enum AccessRole {
  ADMIN
  EDITOR
  MEMBER
  PUBLIC
}

enum PortraitSize {
  # 384x384
  SMALL
  # 1000x1000
  SHARE
  # original, in color
  # not exposed
  # ORIGINAL
}

extend type User {
  address: Address
  credentials: [Credential]!
  badges: [Badge]
  comments(
    after: String
    first: Int
  ): CommentConnection!
  isEligibleForProfile: Boolean

  # url to portrait image
  portrait(size: PortraitSize): String

  birthday: Date
  ageAccessRole: AccessRole
  age: Int

  phoneNumber: String
  phoneNumberNote: String
  phoneNumberAccessRole: AccessRole

  pgpPublicKey: String
  pgpPublicKeyId: String
  emailAccessRole: AccessRole

  biography: String
  facebookId: String
  twitterHandle: String
  publicUrl: String

  statement: String
  isListed: Boolean!
  isAdminUnlisted: Boolean
  sequenceNumber: Int
}

type UserConnection {
  totalCount: Int!
  pageInfo: PageInfo
  nodes: [User]!
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
  id: ID!
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
  displayAuthor: DisplayUser
  # date the user is allowed to submit new comments
  # if null the user can submit immediately
  userWaitUntil: DateTime
}

type DisplayUser {
  id: ID!
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
  parentIds: [ID!]!
  comments: CommentConnection!
  # maybe becomes mdast/JSON later
  content: String
  published: Boolean!
  adminUnpublished: Boolean
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
  hotness: Float!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

type CommentUpdate {
  mutation: MutationType!
  node: Comment!
}

type Greeting {
  id: ID!
  text: String!
}
`
