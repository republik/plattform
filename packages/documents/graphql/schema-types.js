module.exports = `

scalar DateTime
scalar JSON

type Series {
  title: String!
  episodes: [Episode!]!
}

type Episode {
  title: String
  label: String
  image: String
  publishDate: DateTime
  document: Document
}

type AudioSource {
  mp3: String
  aac: String
  ogg: String
}

type Meta {
  title: String
  slug: String
  path: String
  image: String
  emailSubject: String
  description: String
  subject: String
  facebookTitle: String
  facebookImage: String
  facebookDescription: String
  twitterTitle: String
  twitterImage: String
  twitterDescription: String
  prepublication: Boolean
  publishDate: DateTime
  feed: Boolean
  kind: String
  color: String
  series: Series
  format: Document
  dossier: Document

  credits: JSON
  audioSource: AudioSource

  # template of the article
  # if (and only if) this is 'discussion' the page must show
  # the discussion component (in the bottom)
  template: String

  # show debate-icon if this is set or template is 'discussion'
  # href src: linkedDiscussion.document.meta.path ||
  #           linkedDiscussion.path
  linkedDiscussion: Discussion

  # show general feedback if
  # myDiscussion && !myDiscussion.closed &&
  # (!linkedDiscussion || linkedDiscussion.closed)
  ownDiscussion: Discussion
}

input DocumentInput {
  # AST of /article.md
  content: JSON!
}

type Document {
  id: ID!
  # AST of /article.md
  content: JSON!
  meta: Meta!
  children(
    first: Int
    last: Int
    before: ID
    after: ID
  ): DocumentNodeConnection!
  linkedDocuments(
    first: Int
    last: Int
    before: ID
    after: ID
  ): DocumentConnection!
}

type DocumentNode {
  id: ID!
  body: JSON!
}

type DocumentNodePageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}

type DocumentNodeConnection {
  nodes: [DocumentNode!]!
  pageInfo: DocumentNodePageInfo!
  totalCount: Int!
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
`
