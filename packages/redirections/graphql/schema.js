module.exports = `
schema {
  query: queries
}

type queries {
  redirection(path: String): Redirection
}
`
