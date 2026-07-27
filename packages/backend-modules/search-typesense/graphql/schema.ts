export = `
schema {
  query: queries
}

type queries {
  # Mints a short-lived Typesense scoped search key for the calling client to
  # query Typesense directly (no data returned through this API itself).
  # Unauthenticated callers only see searchScope:"public" documents,
  # authenticated members also see "member"-scope profiles, and admin/support
  # callers see everything unfiltered.
  searchApiKey: SearchApiKey!
}
`
