module.exports = `
schema {
  mutation: mutations
}

type mutations {
  "Signed gift token for the article, valid for at least 14 days. The frontend appends it to the article URL as \`?gift=<token>\`."
  createGiftArticleToken(documentId: ID!): String!
}
`
