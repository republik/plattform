const typeDefinitions = `
scalar DateTime
scalar JSON

schema {
  query: RootQuerys
  mutation: RootMutations
}

type RootQuerys {
  me: User
  profile(id: ID!): User
  discussions: [Discussion!]!
}

type RootMutations {
  signIn(email: String!): SignInResponse!
  signOut: Boolean!

  submitComment(
    discussionId: ID!
    content: String!
    discussionPreferences: DiscussionPreferencesInput
  ): Comment!
  editComment(
    id: ID!
    content: String!
  ): Comment!
  unpublishComment(id: ID!): Boolean
  upvoteComment(id: ID!): Comment!
  downvoteComment(id: ID!): Comment!

  setDiscussionPreferences(
    discussionId: ID!
    discussionPreferences: DiscussionPreferencesInput!
  ): DiscussionPreferences!
}


type Credential {
  description: String!
  verified: Boolean!
}

type User {
  id: ID!
  name: String!
  initials: String!
  email: String
  credentials: [Credential!]!
  roles: [String]!
  testimonial: Testimonial
  facebookId: String
  twitterHandle: String
  publicEmail: String
  publicUrl: String
  badges: [Badge]
  latestComments: [Comment]
}

enum Badge {
  CROWDFUNDER
  PATRON
  STAFF
  FREELANCER
}

type Testimonial {
  id: ID!
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

enum NamePreference {
  FULL
  FIRST
  LAST
  F_LAST
  INITIALS
}

type DiscussionRules {
  maxLength: Int
  interval: Int
  anonymity: Permission!
  profilePicture: Permission!
  allowedNames: [NamePreference!]!
}

type DiscussionPreferences {
  anonymity: Boolean!
  profilePicture: Boolean!
  name: NamePreference!
  credential: Credential
}
input DiscussionPreferencesInput {
  anonymity: Boolean!
  profilePicture: Boolean!
  name: NamePreference!
  credential: String
}

enum DiscussionOrder {
  DATE
  VOTES
  HOT
}

type PageInfo {
  endCursor: String
  hasNextPage: Boolean
}
type CommentEdge {
  cursor: String!
  node: Comment!
}
type CommentConnection {
  totalCount: Int!
  pageInfo: PageInfo
  edges: [CommentEdge]!
  nodes: [Comment]!
}

type Discussion {
  id: ID!
  comments(
    parentId: ID
    after: String
    before: String
    first: Int
    last: Int
    # include this comment and context around it
    focusId: ID
    orderBy: DiscussionOrder
  ): CommentConnection!
  rules: DiscussionRules!
  userPreference: DiscussionPreferences!
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
  # admin/mod only if anonymous
  author: User
  displayAuthor: DisplayUser!
  userVote: CommentVote
  userCanEdit: Boolean
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SignInResponse {
  phrase: String!
}
`
module.exports = [typeDefinitions]
