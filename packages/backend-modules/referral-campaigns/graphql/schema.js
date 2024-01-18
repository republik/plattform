module.exports = `
schema {
  query: queries
}


type queries {
  campaigns: [Campaign!]!
}
`
