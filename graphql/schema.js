const typeDefinitions = `
scalar DateTime
scalar JSON

schema {
  query: RootQuerys
  mutation: RootMutations
}

type RootQuerys {
  me: User
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

  depth: Int!
  _depth: Int!
  hottnes: Float!
}

type SignInResponse {
  phrase: String!
}
`
module.exports = [typeDefinitions]
