const { getFeaturedTargets } = require('../lib/Comment')

module.exports = `

type Credential {
  id: ID!
  description: String!
  verified: Boolean!
  isListed: Boolean!
}

extend type User {
  comments(
    after: String
    first: Int
  ): CommentConnection!

  defaultDiscussionNotificationOption: DiscussionNotificationOption
  discussionNotificationChannels: [DiscussionNotificationChannel!]!

  isSuspended: Boolean
  suspendedUntil: DateTime
  suspensions(withInactive: Boolean): [DiscussionSuspension!]
}

enum Permission {
  ALLOWED
  ENFORCED
  FORBIDDEN
}

enum DiscussionNotificationOption {
  MY_CHILDREN
  ALL
  NONE
}
enum DiscussionNotificationChannel {
  WEB
  EMAIL
  APP
}

type DiscussionSuspension {
  id: ID!
  user: User!
  beginAt: DateTime!
  endAt: DateTime!
  reason: String
  issuer: User
  createdAt: DateTime!
  updatedAt: DateTime!
}

type DiscussionRules {
  # max length of a comments content
  maxLength: Int
  # min milliseconds between comments of one user
  minInterval: Int
  anonymity: Permission!
  disableTopLevelComments: Boolean
  allowedRoles: [String!]!
}

type DiscussionPreferences {
  anonymity: Boolean!
  credential: Credential
  notifications: DiscussionNotificationOption
}
input DiscussionPreferencesInput {
  anonymity: Boolean
  credential: String
  notifications: DiscussionNotificationOption
}

enum DiscussionOrder {
  AUTO
  DATE
  VOTES
  HOT
  REPLIES
  FEATURED_AT
}

type DiscussionPageInfo {
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
  directTotalCount: Int
  pageInfo: DiscussionPageInfo
  nodes: [Comment]!
  focus: Comment
  resolvedOrderBy: DiscussionOrder
}

type Discussion {
  id: ID!
  title: String

  # set if this is the discussion of a document
  document: Document

  # path to use if no document is linked
  path: String

  closed: Boolean!
  collapsable: Boolean!
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
    # sort comments so that focus and it's parents are on top
    # focus comment might not be returned in first query if
    # it's too deep nested but it's always returned on
    # the root CommentConnection
    focusId: ID
    orderBy: DiscussionOrder
    orderDirection: OrderDirection
    # if set, the tree is returned flat instead of nested up upon
    # the specified depth
    flatDepth: Int
    # filter root-level by tag (ignored for answers)
    tag: String
    includeParent: Boolean
  ): CommentConnection!
  rules: DiscussionRules!
  # only null for guests (not signedIn)
  userPreference: DiscussionPreferences
  displayAuthor: DisplayUser
  # date the user is allowed to submit new comments
  # if null the user can submit immediately
  userWaitUntil: DateTime
  userCanComment: Boolean!

  tags: [String!]!
  tagBuckets: [DiscussionTagBucket!]!
  # on root level
  tagRequired: Boolean!
}

type DiscussionTagBucket {
  value: String!
  count: Int!
}

type CommentAggregation {
  beginDate: Date
  endDate: Date
  count: Int!
  discussion: Discussion!
}

type DisplayUser {
  id: ID!
  name: String!
  credential: Credential
  profilePicture: String
  anonymity: Boolean!
  slug: String
  username: String @deprecated(reason: "use \`slug\` instead")
}

type Preview {
  string: String!
  more: Boolean!
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
  # mdast
  content: JSON
  text: String
  preview(
    # How many chars a preview string should contain at the most
    length: Int
  ): Preview
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
  hotness: Float!
  tags: [String!]!
  userCanReport: Boolean!
  userReportedAt: DateTime
  numReports: Int
  contentLength: Int
  featuredAt: DateTime
  featuredText: String
  featuredTargets: [CommentFeaturedTarget!]
}

enum CommentFeaturedTarget {
${getFeaturedTargets().join('\n')}
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

extend type Meta {
  # show debate-icon if this is set or template is 'discussion'
  # href src: linkedDiscussion.document.meta.path ||
  #           linkedDiscussion.path
  linkedDiscussion: Discussion

  # show general feedback if
  # myDiscussion && !myDiscussion.closed &&
  # (!linkedDiscussion || linkedDiscussion.closed)
  ownDiscussion: Discussion
}

type DiscussionsStats {
  evolution(
    "Minimum month (YYYY-MM)"
    min: YearMonthDate!
    "Maximum month (YYYY-MM)"
    max: YearMonthDate!
  ): DiscussionsStatsEvolution!
  # Evolution data 30 days ago, until now
  last: DiscussionsStatsBucket!
}

type DiscussionsStatsEvolution {
  buckets: [DiscussionsStatsBucket!]
  updatedAt: DateTime!
}

type DiscussionsStatsBucket {
  "Bucket key (YYYY-MM)"
  key: String!

  "Amount of comments"
  comments: Int!

  "Amount of discussions"
  discussions: Int!

  "Amount of unqiue users"
  users: Int!
  "Amount of unqiue users which posted a comment"
  usersPosted: Int!
  "Amount of unqiue users which voted on a comment"
  usersVoted: Int!

  updatedAt: DateTime!
}
`
