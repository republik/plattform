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

  birthyear: Int
  ageAccessRole: AccessRole
  age: Int

  phoneNumber: String
  phoneNumberNote: String
  phoneNumberAccessRole: AccessRole

  pgpPublicKey: String
  pgpPublicKeyId: String
  emailAccessRole: AccessRole

  # as raw text, use \`biographyContent\` to get mdast
  biography: String
  # biography as mdast
  biographyContent: JSON
  profileUrls: JSON
  disclosures: String
  gender: String

  statement: String
  isListed: Boolean!
  isAdminUnlisted: Boolean
  sequenceNumber: Int

  newsletterSettings: NewsletterSettings!
  prolitterisId: String
}

type NewsletterSettings {
  id: ID!
  status: String!
  subscriptions(name: NewsletterName): [NewsletterSubscription]
}

type NewsletterSubscription {
  id: ID!
  name: NewsletterName!
  subscribed: Boolean!
  isEligible: Boolean! @deprecated(reason: "Eligability is handeld elsewhere. Subscription changes are always possible.")
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
  id: ID!
  name: String
  line1: String!
  line2: String
  postalCode: String!
  city: String!
  country: String!
  createdAt: DateTime!
  updatedAt: DateTime!
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
  ACCOMPLICE
  CLIMATE
  WDWWW
  SUNDAY
}

type Video {
  hls: String!
  mp4: String!
  youtube: String
  subtitles: String
  poster: String
}

type Greeting {
  id: ID!
  text: String!
}

type MembershipStats {
  # Return sum of active or overdue memberships
  count: Int!
  monthlys: [MonthlyMembershipStat!]!
  """
  Returns membership evolution in monthly buckets.
  """
  evolution(
    "Minimum month (YYYY-MM)"
    min: YearMonthDate!
    "Maximum month (YYYY-MM)"
    max: YearMonthDate!
  ): MembershipStatsEvolution!

  lastSeen(
    "Minimum month (YYYY-MM)"
    min: YearMonthDate!
    "Maximum month (YYYY-MM)"
    max: YearMonthDate!
  ): MembershipStatsLastSeen!

  countRange(
    min: DateTime!
    max: DateTime!
  ): Int!
  """
  Returns age distribution for users with active memberships
  """
  ages: MembershipStatsAges!
  """
  Returns name distribution for users with active memberships including sex categorization
  """
  names(first: Int): MembershipStatsNames!
  """
  Returns active membership counts per country/postalCode and year
  """
  geo: MembershipStatsGeo
  """
  Returns active membership counts per city and year 
  """
  geoCities: MembershipStatsgeoCities
}

type MemberStats {
  count: Int!
}

type RoleStats {
  count: Int
}

type MonthlyMembershipStat {
  day: Date!
  newCount: Int!
  renewableCount: Int!
  renewedCount: Int!
  renewedRatio: Float!
}

type MembershipStatsAges {
  averageAge: Float
  buckets: [MembershipStatsAgesBucket!]!
  updatedAt: DateTime!
}

type MembershipStatsAgesBucket {
  key: Int
  count: Int!
}

type MembershipStatsNames {
  buckets: [MembershipStatsNamesBucket!]!
  updatedAt: DateTime!
}

type MembershipStatsNamesBucket {
  key: String
  sex: Sex
  count: Int!
}

enum Sex {
  FEMALE
  MALE
  BOTH
}

type MembershipStatsGeo {
  buckets: [MembershipStatsGeoBucket!]!
  updatedAt: DateTime!
}

type MembershipStatsGeoBucket {
  key: String
  country: String
  postalCode: String
  lat: Float
  lon: Float
  buckets: [MembershipStatsGeoCountBucket!]!
}

type MembershipStatsGeoCountBucket {
  key: String
  count: Int!
}

type MembershipStatsgeoCities {
  buckets: [MembershipStatsgeoCitiesBucket!]!
  updatedAt: DateTime!
}

type MembershipStatsgeoCitiesBucket {
  key: String
  buckets: [MembershipStatsgeoCitiesCountBucket!]!
}

type MembershipStatsgeoCitiesCountBucket {
  key: String
  count: Int!
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

  """
  Returns revenue segments
  """
  segments: RevenueStatsSegments!
}

type RevenueStatsSurplus {
  total: Int!
  updatedAt: DateTime!
}

type RevenueStatsSegments {
  buckets: [RevenueStatsSegmentsDateBucket!]!
  updatedAt: DateTime!
}

type RevenueStatsSegmentsDateBucket {
  key: String!
  buckets: [RevenueStatsSegmentsBucket!]!
}

type RevenueStatsSegmentsBucket {
  key: String!
  label: String!
  "Share"
  share: Float!
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

  "Amount of memberships which ended as of now"
  ended: Int!
  "Amount of memberships which expired as of now"
  expired: Int!
  "Amount of memberships which ended and were cancelled as of now"
  cancelled: Int!
  "Amount of memberships which are active (periods)"
  active: Int!
  "Amount of still or again active crowdfunding memberships (periods)"
  activeCrowdfunders: Int!
  "Amount of still or again active loyalist memberships (periods)"
  activeLoyalists: Int!
  "Amount of memberships which are overdue"
  overdue: Int!

  "Amount of memberships ended during month"
  endedEndOfMonth: Int!
  "Amount of memberships ended during month due to expiration"
  expiredEndOfMonth: Int!
  "Amount of memberships ended during month due to cancellation"
  cancelledEndOfMonth: Int!

  "Amount of active memberships at end of month"
  activeEndOfMonth: Int!
  "Amount of still or again active crowdfunding memberships at end of month"
  activeCrowdfundersEndOfMonth: Int!
  "Amount of still or again active loyalist memberships at end of month"
  activeLoyalistsEndOfMonth: Int!
  "Amount of active memberships at end of month with a donation"
  activeEndOfMonthWithDonation: Int!
  "Amount of active memberships at end of month without a donation"
  activeEndOfMonthWithoutDonation: Int!

  "Amount of memberships ending during month but still prolongable"
  prolongable: Int!
  "Amount of all memberships pending at end of month (ending but still prolongable)"
  pending: Int!
  "Amount of all subscriptions (e.g. MONTHLY_ABO) pending at end of month (ending but still prolongable)"
  pendingSubscriptionsOnly: Int!
}

type MembershipStatsLastSeen {
  buckets: [MembershipStatsLastSeenBucket!]
  updatedAt: DateTime!
}

type MembershipStatsLastSeenBucket {
  "Bucket key (YYYY-MM)"
  key: String!
  users: Int!
}

`
