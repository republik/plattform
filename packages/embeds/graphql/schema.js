module.exports = `

schema {
  query: queries
}

type queries {
  embed(id: ID!, embedType: EmbedType!): Embed!
}

`
