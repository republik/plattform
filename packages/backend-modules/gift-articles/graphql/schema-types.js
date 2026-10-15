module.exports = `

type GiftArticleLink {
  id: ID!
  token: String!
  url: String!
  "Sanity document ref, \`sanity:<publishedId>\`"
  documentId: ID!
  documentPath: String!
  createdAt: DateTime!
  expiresAt: DateTime!
}

type GiftTokenValidation {
  valid: Boolean!
  documentId: ID!
  documentPath: String!
  expiresAt: DateTime!
  "Only set for a valid link"
  granter: GiftGranter
}

type GiftGranter {
  name: String!
  portrait: String
  hasPublicProfile: Boolean!
}

`
