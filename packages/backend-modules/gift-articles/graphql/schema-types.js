module.exports = `

type GiftArticleLink {
  id: ID!
  token: String!
  url: String!
  documentPath: String!
  expiresAt: DateTime!
  createdAt: DateTime!
}

type GiftArticleStatus {
  remainingGiftsThisMonth: Int!
  maxGiftsPerMonth: Int!
  existingLink: GiftArticleLink
}

type GiftTokenValidation {
  valid: Boolean!
  documentPath: String
  expiresAt: DateTime
  granter: GiftGranter
}

type GiftGranter {
  name: String!
  portrait: String
  hasPublicProfile: Boolean!
}

`
