module.exports = `
schema {
  query: queries
}


type queries {
  campaign(id: ID!): Campaign
}
`
