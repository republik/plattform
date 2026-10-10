module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  validateGiftToken(token: String!): GiftTokenValidation
}

type mutations {
  createGiftArticleLink(
    documentId: ID!
    documentPath: String!
  ): GiftArticleLink!
}
`
