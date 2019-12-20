module.exports = `

enum AccessRole {
  ADMIN
  EDITOR
  MEMBER
  PUBLIC
}

# deprecated: use ImageProperties instead
enum PortraitSize {
  # 384x384
  SMALL @deprecated(reason: "use \`ImageProperties\` instead")
  # 1000x1000
  SHARE @deprecated(reason: "use \`ImageProperties\` instead")
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
  slug: String

  address: Address
  hasAddress: Boolean
  credentials: [Credential!]!
  badges: [Badge]
  isEligibleForProfile: Boolean

  # url to portrait image
  portrait(
    size: PortraitSize # deprecated: "use ImageProperties instead"
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
  disclosures: String

  statement: String
  isListed: Boolean!
  isAdminUnlisted: Boolean
  sequenceNumber: Int

  newsletterSettings: NewsletterSettings!
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

type PageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
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

type MediaResponse {
  medium: String
  publishDate: String
  title: String
  url: String
}

type Employee {
  group: String
  subgroup: String
  name: String
  title: String
  greeting: String
  user: User
}

type Greeting {
  id: ID!
  text: String!
}

type MutationResult {
  success: Boolean!
}

type MembershipStats {
  # number of distinct users with an active memberships
  count: Int!
  monthlys: [MonthlyMembershipStat!]!
  periods(
    minEndDate: Date!
    maxEndDate: Date!
    # filter by membershipTypes
    # default: [ABO]
    membershipTypes: [String!]
  ): MembershipPeriodStats!
  """
  Returns membership evolution in monthly buckets.
  """
  evolution(
    "Minimum month (YYYY-MM)"
    min: YearMonthDate!
    "Maximum month (YYYY-MM)"
    max: YearMonthDate!
  ): MembershipStatsEvolution!
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

type MembershipPeriodStats {
  # combination: minEndDate-maxEndDate-membershipTypes
  id: ID!
  totalMemberships: Int!
  # any day that an action occurred that affected a period that ended within the specified end dates
  days: [MembershipPeriodStatsDay!]!
}

type MembershipPeriodStatsDay {
  # combination: dayDate-membershipTypes
  id: ID!
  date: Date!
  cancelCount: Int!
  prolongCount: Int!
}

type StatementUserConnection {
  totalCount: Int!
  pageInfo: PageInfo
  nodes: [StatementUser!]!
}
type StatementUser {
  id: ID!
  name: String!
  slug: String
  portrait(
    properties: ImageProperties
  ): String
  statement: String
  credentials: [Credential!]!
  updatedAt: DateTime!
  sequenceNumber: Int
  hasPublicProfile: Boolean!
}

type RevenueStats {
  """
  Returns surplus, an amount of money payments exceeds their pledge values ("revenue").
  Example: [pledge total] - [memerships] - [goodies] = [surplus].
  """
  surplus(
    min: DateTime!
    max: DateTime
  ): RevenueStatsSurplus!
}

type RevenueStatsSurplus {
  total: Int!
  updatedAt: DateTime!
}

type MembershipStatsEvolution {
  buckets: [MembershipStatsEvolutionBucket!]
  updatedAt: DateTime!
}

type MembershipStatsEvolutionBucket {
  "Bucket key (YYYY-MM)"
  key: String!

  "Amount of active memberships at beginning of month"
  activeBeginningOfMonth: Int!

  "Amount of memberships gained during month"
  gaining: Int!
  "Amount of memberships gained during month with donation"
  gainingWithDonation: Int!
  "Amount of memberships gained during month without donation"
  gainingWithoutDonation: Int!

  "Amount of memberships ending during month"
  ending: Int!
  "Amount of memberships ending during month but still prolongable"
  prolongable: Int!
  "Amount of memberships ended during month due to expiration"
  expired: Int!
  "Amount of memberships ended during month due to cancellation"
  cancelled: Int!

  "Amount of active memberships at end of month"
  activeEndOfMonth: Int!
  "Amount of active memberships at end of month with a donation"
  activeEndOfMonthWithDonation: Int!
  "Amount of active memberships at end of month without a donation"
  activeEndOfMonthWithoutDonation: Int!

  "Amount of all memberships pending at end of month (ending but still prolongable)"
  pending: Int!
  "Amount of all subscriptions (e.g. MONTHLY_ABO) pending at end of month (ending but still prolongable)"
  pendingSubscriptionsOnly: Int!
}

`
