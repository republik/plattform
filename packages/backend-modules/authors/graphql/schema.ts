export = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  authors: [Author]
  author(id: ID): Author
}

type mutations {
  addAuthor(
    firstName: String!
    lastName: String!
    bio: String
    publicUrls: JSON
    userId: String
    gender: String
    prolitterisId: String
    portraitUrl: String
    slug: String
  ): Author!

  updateAuthor(
    id: ID!
    firstName: String
    lastName: String
    bio: String
    publicUrls: JSON
    userId: String
    gender: String
    prolitterisId: String
    portraitUrl: String
    slug: String
  ): Author!
}
`
