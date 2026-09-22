export = `
schema {
  query: queries
}

type queries {
  # Mints a short-lived Typesense scoped search key for the calling client to
  # query Typesense directly (no data returned through this API itself).
  # The key restricts WHICH COLLECTIONS the caller may search and carries no
  # document filter. All callers currently receive the same collection set
  # (articles, comments, users); only public user profiles are indexed at all.
  searchApiKey: SearchApiKey!
}
`
