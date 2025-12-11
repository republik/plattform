module.exports = `

scalar DateTime
scalar JSON

type Series {
  title: String!
  description: String
  logo: String
  logoDark: String
  overview: Document
  episodes: [Episode!]!
}

type Episode {
  label: String
  title: String
  lead: String
  image: String
  publishDate: DateTime
  document: Document
}

type AudioSource implements PlayableMedia {
  mediaId: ID!
  kind: AudioSourceKind
  mp3: String
  aac: String
  ogg: String
  durationMs: Int!
}

enum AudioSourceKind {
  podcast
  readAloud
  syntheticReadAloud
} 

type Podcast {
  podigeeSlug: String
  spotifyUrl: String
  googleUrl: String
  appleUrl: String
}

type Newsletter {
  name: String
  free: Boolean
}

enum PaynoteMode {
  button
  trialForm
  noPaynote
} 

type Contributor {
  name: String!
  kind: String
  user: User
}

type Crop {
  x: Int
  y: Int
  width: Int
  height: Int 
}

type Meta {
  title: String
  shortTitle: String
  slug: String
  path: String
  image: String
  audioCoverCrop: Crop
  emailSubject: String
  description: String
  subject: String @deprecated(reason: "parse \`Document.content\` instead")
  facebookTitle: String
  facebookImage: String
  facebookDescription: String
  twitterTitle: String
  twitterImage: String
  twitterDescription: String
  seoTitle: String
  seoDescription: String
  shareText: String
  shareFontSize: Int
  shareInverted: Boolean
  shareTextPosition: String
  prepublication: Boolean
  publishDate: DateTime
  lastPublishedAt: DateTime
  feed: Boolean
  gallery: Boolean
  kind: String
  color: String
  series: Series
  section: Document
  format: Document
  dossier: Document
  recommendations: DocumentConnection
  shareLogo: String
  shareBackgroundImage: String
  shareBackgroundImageInverted: String

  credits: JSON
  contributors: [Contributor!]!

  audioSource: AudioSource
  audioCover(properties: ImageProperties): String
  podcast: Podcast
  willBeReadAloud: Boolean
  syntheticVoice: String
  syntheticVoice2: String

  newsletter: Newsletter

  disableActionBar: Boolean
  suggestSubscription: Boolean

  estimatedReadingMinutes: Int
  estimatedConsumptionMinutes: Int

  # template of the article
  template: String

  indicateChart: Boolean
  indicateGallery: Boolean
  indicateVideo: Boolean
  
  paynotes: [JSON]
  paynoteMode: PaynoteMode
  
  sendAsEmail: Boolean

  # article is excluded from paywall
  isPaywallExcluded: Boolean
}

enum DocumenSchemaType {
  mdast
  slate @deprecated(reason: "Not used anymore")
}

input DocumentInput {
  type: DocumenSchemaType
  content: JSON!
}

type Document {
  id: ID!
  repoId: ID!
  issuedForUserId: ID

  type: DocumenSchemaType! @deprecated(reason: "Not used anymore, always mdast")
  content: JSON!

  meta: Meta!
  children(
    first: Int
    last: Int
    before: ID
    after: ID
    only: ID
  ): DocumentBlockConnection!
  linkedDocuments(
    first: Int
    last: Int
    before: ID
    after: ID
    feed: Boolean
  ): DocumentConnection!
}

type DocumentBlock {
  id: ID!
  body: JSON!
}

type DocumentBlockPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

type DocumentBlockConnection {
  nodes: [DocumentBlock!]!
  pageInfo: DocumentBlockPageInfo!
  totalCount: Int!
}

type DocumentZone {
  id: ID!
  hash: String!
  identifier: String!
  data: JSON!
  text: String
  type: DocumenSchemaType! @deprecated(reason: "Not used anymore, always mdast")
  node: JSON!
  document: Document
}

type DocumentConnection {
  nodes: [Document!]!
  pageInfo: DocumentPageInfo!
  totalCount: Int!
}

extend type User {
  documents(
    feed: Boolean
    first: Int
    last: Int
    before: String
    after: String
  ): DocumentConnection!
}

type DocumentPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

interface PlayableMedia {
  mediaId: ID!
  durationMs: Int!
}
`
