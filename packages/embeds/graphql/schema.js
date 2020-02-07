module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  embed(id: ID!, embedType: EmbedType!): Embed!
}

type mutations {
  refetchEmbed(url: String!): CachedEmbed
}
`
