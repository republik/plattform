export = `
type SearchApiKey {
  # Scoped to the articles/comments/users collections, with a searchScope
  # filter baked in matching the caller's tier (public/member/admin -- see
  # lib/scopedKey.ts). Usable directly against Typesense's search endpoint.
  key: String!
  expiresAt: DateTime!
}
`
