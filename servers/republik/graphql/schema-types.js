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
  SMALL @deprecated(reason: "use ImageProperties instead")
  # 1000x1000
  SHARE @deprecated(reason: "use ImageProperties instead")
  # original, in color
  # not exposed
  # ORIGINAL
}

input ImageProperties {
  # resize width
  width: Int
  # resize height
  height: Int
  # greyscale
  bw: Boolean
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
  portrait(
    size: PortraitSize @deprecated(reason: "use ImageProperties instead"),
    properties: ImageProperties
  ): String

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

  newsletterSettings: NewsletterSettings!

  defaultDiscussionNotificationOption: DiscussionNotificationOption
  discussionNotificationChannels: [DiscussionNotificationChannel!]!
}

type NewsletterSettings {
  status: String!
  subscriptions: [NewsletterSubscription]
}

type NewsletterSubscription {
  id: ID!
  name: String!
  subscribed: Boolean!
  isEligible: Boolean!
}

type WebNotification {
  title: String!
  body: String!
  icon: String!
  url: String!
  # see https://developer.mozilla.org/en-US/docs/Web/API/Notification/tag
  tag: String!
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

enum NewsletterName {
  DAILY
  WEEKLY
  PROJECTR
}

type Video {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}

type Faq {
  category: String
  question: String
  answer: String
}

type Event {
  slug: String
  title: String
  description: String
  link: String
  date: Date
  time: String
  where: String
  locationLink: String
  metaDescription: String
  socialMediaImage: String
}

type Update {
  slug: String
  title: String
  text: String
  publishedDateTime: DateTime
  metaDescription: String
  socialMediaImage: String
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
  notifications: DiscussionNotificationOption!
}
input DiscussionPreferencesInput {
  anonymity: Boolean
  credential: String
  notifications: DiscussionNotificationOption
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
  directTotalCount: Int
  pageInfo: PageInfo
  nodes: [Comment]!
  focus: Comment
}

type Discussion {
  id: ID!
  title: String
  documentPath: String
  closed: Boolean!
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
  ): CommentConnection!
  rules: DiscussionRules!
  # only null for guests (not signedIn)
  userPreference: DiscussionPreferences
  displayAuthor: DisplayUser
  # date the user is allowed to submit new comments
  # if null the user can submit immediately
  userWaitUntil: DateTime
  userCanComment: Boolean!
}

type DisplayUser {
  id: ID!
  name: String!
  credential: Credential
  profilePicture: String
  anonymity: Boolean!
  username: String
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

type MutationResult {
  success: Boolean!
}

type MembershipStats {
  count: Int!
  monthlys: [MonthlyMembershipStat!]!
}
type MemberStats {
  count: Int!
}

type MonthlyMembershipStat {
  day: Date!
  newCount: Int!
  renewableCount: Int!
  renewedCount: Int!
  renewedRatio: Float!
}
`
