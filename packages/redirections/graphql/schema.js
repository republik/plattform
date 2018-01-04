module.exports = `
schema {
  query: queries
}

type queries {
  # empty response: 404
  redirection(path: String): Redirection
}
`
