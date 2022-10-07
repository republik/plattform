module.exports = `

schema {
  query: queries
}

type queries {
  meta(locale: Locale!): Meta
  page(locale: Locale!, path: [String!]!): Page
  articles(locale: Locale!, limit: Int = 2, page: Int = 0): ArticleList!
  parliamentarians(locale: Locale!): [Parliamentarian!]!
  getParliamentarian(locale: Locale!, id: ID!): Parliamentarian
  guests(locale: Locale!): [Guest!]!
  getGuest(locale: Locale!, id: ID!): Guest
  getOrganisation(locale: Locale!, id: ID!): Organisation
  lobbyGroups(locale: Locale!): [LobbyGroup!]!
  getLobbyGroup(locale: Locale!, id: ID!): LobbyGroup
  branchs(locale: Locale!): [Branch!]!
  getBranch(locale: Locale!, id: ID!): Branch
  search(locale: Locale!, term: String!): [Entity!]!
  translations(locale: Locale!): [Translation!]!
}

`
