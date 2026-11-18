module.exports = `
schema {
  mutation: mutations
}

type mutations {
  "Signed gift link (URL) for the article, valid for at least 14 days"
  createGiftArticleLink(documentId: ID!, documentPath: String!): String!
}
`
