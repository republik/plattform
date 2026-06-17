module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  giftArticleStatus(documentPath: String!): GiftArticleStatus!
  validateGiftToken(token: String!): GiftTokenValidation
}

type mutations {
  createGiftArticleLink(documentPath: String!): GiftArticleLink!
}
`
