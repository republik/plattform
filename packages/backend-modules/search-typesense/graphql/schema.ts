export = `
schema {
  query: queries
}

type SearchApiKey {
  # Scoped to the articles/comments/users collections, with a searchScope
  # filter baked in matching the caller's tier (public/member/admin -- see
  # lib/scopedKey.ts). Usable directly against Typesense's search endpoint.
  key: String!
  expiresAt: DateTime!
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
